import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // 1. If Supabase Auth is configured, verify credentials against Supabase Auth
    if (isSupabaseConfigured) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: cleanEmail,
        password: String(password)
      });

      if (!authError && authData.session && authData.user) {
        // Fetch application user profile
        const profile = await prisma.user.findFirst({
          where: {
            OR: [
              { id: authData.user.id },
              { email: cleanEmail }
            ]
          },
          include: {
            organization: true,
            primaryJurisdiction: true,
            userJurisdictions: {
              include: { jurisdiction: true }
            }
          }
        });

        const jurisdictionSet = new Set<string>();
        if (profile?.primaryJurisdictionId) jurisdictionSet.add(profile.primaryJurisdictionId);
        profile?.userJurisdictions?.forEach(uj => {
          if (uj.jurisdictionId) jurisdictionSet.add(uj.jurisdictionId);
        });

        const authorizedJurisdictionIds = Array.from(jurisdictionSet);

        return res.json({
          success: true,
          token: authData.session.access_token,
          user: {
            id: profile?.id || authData.user.id,
            name: profile?.name || authData.user.user_metadata?.full_name || 'District Operator',
            email: cleanEmail,
            role: profile?.role || 'OPERATOR',
            organization: profile?.organization?.name || 'Municipal Corporation',
            organizationId: profile?.organizationId || '',
            primaryJurisdiction: profile?.primaryJurisdiction?.name || 'Assigned District',
            primaryJurisdictionId: profile?.primaryJurisdictionId || '',
            authorizedJurisdictions: authorizedJurisdictionIds
          }
        });
      }
    }

    // 2. Offline / Demo Credentials Fallback (preserves testing without network dependencies)
    if (cleanEmail === 'admin@climateshield.demo' && password === 'demo123') {
      const profile = await prisma.user.findFirst({
        where: { email: cleanEmail },
        include: {
          organization: true,
          primaryJurisdiction: true,
          userJurisdictions: true
        }
      });

      const jurisdictionSet = new Set<string>();
      if (profile?.primaryJurisdictionId) jurisdictionSet.add(profile.primaryJurisdictionId);
      profile?.userJurisdictions?.forEach(uj => {
        if (uj.jurisdictionId) jurisdictionSet.add(uj.jurisdictionId);
      });
      if (jurisdictionSet.size === 0) jurisdictionSet.add('jur-amalapuram-region');

      return res.json({
        success: true,
        token: 'demo-jwt-session-token-climateshield-2024',
        user: {
          id: profile?.id || 'user-elena-vance',
          name: profile?.name || 'Elena Vance',
          email: cleanEmail,
          role: profile?.role || 'OPERATOR',
          organization: profile?.organization?.name || 'Amalapuram Municipal Corporation',
          organizationId: profile?.organizationId || 'org-amalapuram-mc',
          primaryJurisdiction: profile?.primaryJurisdiction?.name || 'Amalapuram Region Operations Command',
          primaryJurisdictionId: profile?.primaryJurisdictionId || 'jur-amalapuram-region',
          authorizedJurisdictions: Array.from(jurisdictionSet)
        }
      });
    }

    if (cleanEmail === 'operator.tuni@climateshield.demo' && password === 'demo123') {
      const profile = await prisma.user.findFirst({
        where: { email: cleanEmail },
        include: {
          organization: true,
          primaryJurisdiction: true,
          userJurisdictions: true
        }
      });

      const jurisdictionSet = new Set<string>();
      if (profile?.primaryJurisdictionId) jurisdictionSet.add(profile.primaryJurisdictionId);
      profile?.userJurisdictions?.forEach(uj => {
        if (uj.jurisdictionId) jurisdictionSet.add(uj.jurisdictionId);
      });
      if (jurisdictionSet.size === 0) jurisdictionSet.add('jur-tuni-district');

      return res.json({
        success: true,
        token: 'demo-tuni-jwt-session-token',
        user: {
          id: profile?.id || 'user-ravi-kumar-tuni',
          name: profile?.name || 'Ravi Kumar',
          email: cleanEmail,
          role: profile?.role || 'OPERATOR',
          organization: profile?.organization?.name || 'Tuni Municipal Corporation',
          organizationId: profile?.organizationId || 'org-tuni-mc',
          primaryJurisdiction: profile?.primaryJurisdiction?.name || 'Tuni District Operations Command',
          primaryJurisdictionId: profile?.primaryJurisdictionId || 'jur-tuni-district',
          authorizedJurisdictions: Array.from(jurisdictionSet)
        }
      });
    }

    return res.status(401).json({ 
      success: false,
      error: 'Invalid credentials. Please verify your official email and password.' 
    });
  } catch (error: any) {
    console.error('Login error:', error.message || error);
    return res.status(500).json({ success: false, error: 'Authentication service encountered an unexpected error.' });
  }
};
