import { Response } from 'express';
import { LocationService } from '../services/locations/locationService.js';
import { RiskEngine } from '../services/risk/riskEngine.js';
import { AuthenticatedRequest, isAuthorizedForJurisdiction } from '../middlewares/authMiddleware.js';

export const getRiskByLocationId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { locationId } = req.params;
    const location = await LocationService.getLocationById(locationId);

    if (!location) {
      return res.status(404).json({ success: false, error: `Location '${locationId}' not found.` });
    }

    // IDOR Enforcement: ensure location belongs to user's authorized district
    if (!isAuthorizedForJurisdiction(req, location.jurisdictionId)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You are not authorized to view risk telemetry for location '${locationId}' in another district.`
      });
    }

    const latest = location.latestReading || (location as any).environmental || {
      rainfallMm: 85,
      waterLevelCm: 42
    };

    const riskResult = RiskEngine.calculateFloodRisk({
      rainfallMm: latest.rainfallMm,
      waterLevelCm: latest.waterLevelCm,
      drainageCondition: location.drainageCondition,
      historicalIncidents: location.historicalIncidents
    });

    return res.json({
      success: true,
      locationId: location.id,
      jurisdictionId: location.jurisdictionId,
      locationName: location.name,
      environmental: latest,
      ...riskResult
    });
  } catch (error: any) {
    console.error('Error in getRiskByLocationId:', error);
    return res.status(500).json({ success: false, error: 'Failed to calculate risk score.' });
  }
};

export const calculateCustomRisk = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { rainfallMm, waterLevelCm, drainageCondition, historicalIncidents } = req.body;

    if (rainfallMm === undefined || waterLevelCm === undefined) {
      return res.status(400).json({ success: false, error: 'rainfallMm and waterLevelCm are required.' });
    }

    const result = RiskEngine.calculateFloodRisk({
      rainfallMm: Number(rainfallMm),
      waterLevelCm: Number(waterLevelCm),
      drainageCondition: drainageCondition || 'Moderate',
      historicalIncidents: Number(historicalIncidents || 0)
    });

    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in calculateCustomRisk:', error);
    return res.status(500).json({ success: false, error: 'Failed to evaluate custom risk.' });
  }
};
