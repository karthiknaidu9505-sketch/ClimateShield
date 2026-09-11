import { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthenticatedRequest, isAuthorizedForJurisdiction } from '../middlewares/authMiddleware.js';

export const getTeams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedJurisdictionId = req.query.jurisdictionId as string | undefined;
    const allowedJurisdictionIds = req.user?.authorizedJurisdictionIds || [];

    const where: any = {};
    if (requestedJurisdictionId) {
      if (!isAuthorizedForJurisdiction(req, requestedJurisdictionId)) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: You are not authorized to view response teams for jurisdiction '${requestedJurisdictionId}'.`
        });
      }
      where.jurisdictionId = requestedJurisdictionId;
    } else {
      where.jurisdictionId = { in: allowedJurisdictionIds };
    }

    const teams = await prisma.responseTeam.findMany({
      where,
      include: {
        members: true,
        incidents: {
          where: { status: { not: 'RESOLVED' } }
        }
      }
    });

    const parsedTeams = teams.map(team => ({
      ...team,
      equipment: typeof team.equipment === 'string' ? JSON.parse(team.equipment) : (team.equipment || [])
    }));

    return res.json({ success: true, count: parsedTeams.length, data: parsedTeams });
  } catch (error: any) {
    console.error('Error in getTeams:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve response teams.' });
  }
};
