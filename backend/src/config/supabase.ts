import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase URL
export const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';

// Current API Key Model: SUPABASE_SECRET_KEY (with fallback to legacy SUPABASE_SERVICE_ROLE_KEY)
export const supabaseSecretKey = 
  process.env.SUPABASE_SECRET_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'placeholder-secret-key';

// Current API Key Model: SUPABASE_PUBLISHABLE_KEY (with fallback to legacy SUPABASE_ANON_KEY)
export const supabasePublishableKey = 
  process.env.SUPABASE_PUBLISHABLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  'placeholder-publishable-key';

// Optional JWKS endpoint for cryptographic JWT validation
export const supabaseJwksUrl = 
  process.env.SUPABASE_JWKS_URL || 
  (process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json` : '');

export const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && 
  !process.env.SUPABASE_URL.includes('your-project') &&
  !process.env.SUPABASE_URL.includes('placeholder') &&
  (
    (process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SECRET_KEY.includes('your-supabase')) ||
    (process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your-supabase'))
  )
);

/**
 * Supabase Admin Client (Secret Key / Service Role)
 * Used by backend services for administrative operations, data access,
 * and user token validation.
 */
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
