import { Request, Response } from 'express';
import { LocationService } from '../services/locations/locationService.js';

export const getLocations = async (req: Request, res: Response) => {
  try {
    const jurisdictionId = req.query.jurisdictionId as string | undefined;
    const locations = await LocationService.getAllLocations(jurisdictionId);
    return res.json({ success: true, count: locations.length, data: locations });
  } catch (error: any) {
    console.error('Error getting locations:', error);
    return res.status(500).json({ error: 'Failed to retrieve locations.' });
  }
};

export const getLocationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const location = await LocationService.getLocationById(id);

    if (!location) {
      return res.status(404).json({ error: `Location '${id}' not found.` });
    }

    return res.json({ success: true, data: location });
  } catch (error: any) {
    console.error(`Error getting location ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to retrieve location details.' });
  }
};
