import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. If Supabase Auth is configured, verify credentials against Supabase Auth
    if (isSupabaseConfigured) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (!authError && authData.session) {
        // Fetch application user profile
        let profile = await prisma.user.findUnique({
          where: { id: authData.user.id },
          include: { organization: true, primaryJurisdiction: true }
        });

        return res.json({
          success: true,
          token: authData.session.access_token,
          user: {
            id: authData.user.id,
            name: profile?.name || authData.user.user_metadata?.full_name || 'Operations Officer',
            email: authData.user.email,
            role: profile?.role || 'OPERATOR',
            organization: profile?.organization?.name || 'Amalapuram Municipal Corporation',
            organizationId: profile?.organizationId || 'org-amalapuram-mc',
            primaryJurisdiction: profile?.primaryJurisdiction?.name || 'Amalapuram Region',
            primaryJurisdictionId: profile?.primaryJurisdictionId || 'jur-amalapuram-region'
          }
        });
      }
    }

    // 2. Demo credentials fallback (offline / demo evaluation mode)
    // No plaintext passwords are stored in the database!
    if (cleanEmail === 'admin@climateshield.demo' && password === 'demo123') {
      return res.json({
        success: true,
        token: 'demo-jwt-session-token-climateshield-2024',
        user: {
          id: 'user-elena-vance',
          name: 'Elena Vance',
          email: 'admin@climateshield.demo',
          role: 'OPERATOR',
          organization: 'Amalapuram Municipal Corporation',
          organizationId: 'org-amalapuram-mc',
          primaryJurisdiction: 'Amalapuram Region',
          primaryJurisdictionId: 'jur-amalapuram-region'
        }
      });
    }

    return res.status(401).json({ 
      error: 'Invalid credentials. Use admin@climateshield.demo / demo123 for demo access.' 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};
