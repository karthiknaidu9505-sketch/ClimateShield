import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { prisma } from '../config/db.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
    primaryJurisdictionId?: string;
    name?: string;
  };
}

/**
 * Supabase JWT Authentication Middleware
 * Validates the Authorization: Bearer <token> header.
 * Compatible with Supabase Auth JWTs while supporting offline fallback sessions.
 */
export const requireAuth = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Missing Bearer token in Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Support offline / demo mode sessions without crashing
    if (token.includes('demo') || token.includes('climateshield')) {
      req.user = {
        id: 'user-elena-vance',
        email: 'admin@climateshield.demo',
        name: 'Elena Vance',
        role: 'OPERATOR',
        organizationId: 'org-amalapuram-mc',
        primaryJurisdictionId: 'jur-amalapuram-region'
      };
      return next();
    }

    // Verify token with Supabase Auth
    if (isSupabaseConfigured) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: error?.message || 'Invalid or expired authentication session.'
        });
      }

      // Lookup user profile in database to get jurisdiction & organization
      try {
        const profile = await prisma.user.findUnique({
          where: { id: user.id },
          include: { organization: true, primaryJurisdiction: true }
        });

        req.user = {
          id: user.id,
          email: user.email || '',
          name: profile?.name || user.user_metadata?.full_name || 'Operations Officer',
          role: profile?.role || 'OPERATOR',
          organizationId: profile?.organizationId,
          primaryJurisdictionId: profile?.primaryJurisdictionId
        };
      } catch {
        // Fallback to basic user metadata if DB query fails
        req.user = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || 'Operations Officer',
          role: 'OPERATOR'
        };
      }

      return next();
    }

    // If Supabase not yet configured, allow demo token fallback
    req.user = {
      id: 'user-elena-vance',
      email: 'admin@climateshield.demo',
      name: 'Elena Vance',
      role: 'OPERATOR',
      organizationId: 'org-amalapuram-mc',
      primaryJurisdictionId: 'jur-amalapuram-region'
    };
    return next();
  } catch (err: any) {
    console.error('Error in auth middleware:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication verification encountered a server error.'
    });
  }
};

/**
 * Optional Auth Middleware: Extracts user if token is provided, otherwise continues
 */
export const optionalAuth = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return requireAuth(req, res, next);
};
