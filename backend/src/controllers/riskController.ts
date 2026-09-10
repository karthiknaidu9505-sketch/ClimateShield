import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { RiskEngine } from '../services/risk/riskEngine.js';

export const getRiskByLocationId = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    if (!location) {
      return res.status(404).json({ error: `Location '${locationId}' not found.` });
    }

    const latest = location.readings[0] || {
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
      locationName: location.name,
      environmental: latest,
      ...riskResult
    });
  } catch (error: any) {
    console.error('Error in getRiskByLocationId:', error);
    return res.status(500).json({ error: 'Failed to calculate risk score.' });
  }
};

export const calculateCustomRisk = async (req: Request, res: Response) => {
  try {
    const { rainfallMm, waterLevelCm, drainageCondition, historicalIncidents } = req.body;

    if (rainfallMm === undefined || waterLevelCm === undefined) {
      return res.status(400).json({ error: 'rainfallMm and waterLevelCm are required.' });
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
    return res.status(500).json({ error: 'Failed to evaluate custom risk.' });
  }
};
