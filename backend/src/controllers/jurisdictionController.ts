import { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export const getJurisdictions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allowedJurisdictionIds = req.user?.authorizedJurisdictionIds || [];

    const jurisdictions = await prisma.jurisdiction.findMany({
      where: {
        id: { in: allowedJurisdictionIds }
      },
      include: {
        organization: true,
        zones: true,
        _count: {
          select: {
            locations: true,
            incidents: { where: { status: { not: 'RESOLVED' } } }
          }
        }
      }
    });

    const formatted = jurisdictions.map(j => ({
      id: j.id,
      organizationId: j.organizationId,
      organization: j.organization,
      name: j.name,
      code: j.code,
      centerLat: j.centerLat,
      centerLng: j.centerLng,
      zones: j.zones,
      locationCount: j._count.locations,
      activeIncidents: j._count.incidents
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error: any) {
    console.error('Error fetching jurisdictions:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve jurisdictions.' });
  }
};
