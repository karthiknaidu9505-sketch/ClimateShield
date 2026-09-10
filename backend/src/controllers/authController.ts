import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Lookup user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { responseTeam: true }
    });

    if (!user || user.password !== password) {
      // Demo authentication allows admin@climateshield.demo / demo123
      if (email === 'admin@climateshield.demo' && password === 'demo123') {
        return res.json({
          success: true,
          token: 'demo-jwt-session-token-climateshield-2024',
          user: {
            id: 'demo-user-1',
            name: 'Elena Vance',
            email: 'admin@climateshield.demo',
            role: 'Lead Operations Officer, District 4',
            jurisdiction: 'Amalapuram / Metro District North'
          }
        });
      }
      return res.status(401).json({ error: 'Invalid credentials. Use admin@climateshield.demo / demo123 for demo access.' });
    }

    return res.json({
      success: true,
      token: 'demo-jwt-session-token-climateshield-2024',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.responseTeam?.name
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};
