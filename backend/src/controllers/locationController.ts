import { Response } from 'express';
import { LocationService } from '../services/locations/locationService.js';
import { AuthenticatedRequest, isAuthorizedForJurisdiction } from '../middlewares/authMiddleware.js';

export const getLocations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedJurisdictionId = req.query.jurisdictionId as string | undefined;

    if (requestedJurisdictionId) {
      if (!isAuthorizedForJurisdiction(req, requestedJurisdictionId)) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: You are not authorized to access jurisdiction '${requestedJurisdictionId}'.`
        });
      }
      const locations = await LocationService.getAllLocations(requestedJurisdictionId);
      return res.json({ success: true, count: locations.length, data: locations });
    }

    // Default: scope to the operator's authorized jurisdictions
    const allowedJurisdictions = req.user?.authorizedJurisdictionIds || [];
    const locations = await LocationService.getAllLocations(undefined, allowedJurisdictions);
    return res.json({ success: true, count: locations.length, data: locations });
  } catch (error: any) {
    console.error('Error getting locations:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve locations.' });
  }
};

export const getLocationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const location = await LocationService.getLocationById(id);

    if (!location) {
      return res.status(404).json({ success: false, error: `Location '${id}' not found.` });
    }

    // IDOR Enforcement: ensure operator is authorized for this location's jurisdiction
    if (!isAuthorizedForJurisdiction(req, location.jurisdictionId)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You are not authorized to access location '${id}' in another district.`
      });
    }

    return res.json({ success: true, data: location });
  } catch (error: any) {
    console.error(`Error getting location ${req.params.id}:`, error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve location details.' });
  }
};
