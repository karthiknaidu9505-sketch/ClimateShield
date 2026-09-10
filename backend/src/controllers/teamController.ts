import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getTeams = async (_req: Request, res: Response) => {
  try {
    const teams = await prisma.responseTeam.findMany({
      include: {
        members: true,
        incidents: {
          where: { status: { not: 'RESOLVED' } }
        }
      }
    });

    const parsedTeams = teams.map(team => ({
      ...team,
      equipment: JSON.parse(team.equipment || '[]')
    }));

    return res.json({ success: true, data: parsedTeams });
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({ error: 'Failed to fetch response teams.' });
  }
};
