import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';
import { apiRequest, isOfflineMode } from '../services/api.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  organizationId?: string;
  primaryJurisdiction?: string;
  primaryJurisdictionId?: string;
  authorizedJurisdictions?: string[];
  team?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: string;
  organization: string;
  primaryJurisdiction: string;
  primaryJurisdictionId: string;
  authorizedJurisdictions: string[];
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Restore authenticated user profile from localStorage if present
    const savedUser = localStorage.getItem('climateshield_user');
    const savedToken = localStorage.getItem('climateshield_token');
    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        setUser(null);
        localStorage.removeItem('climateshield_user');
        localStorage.removeItem('climateshield_token');
      }
    }

    // 2. Check Supabase Auth session if configured
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (currentSession?.user) {
          setSession(currentSession);
          localStorage.setItem('climateshield_token', currentSession.access_token);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        if (newSession?.access_token) {
          localStorage.setItem('climateshield_token', newSession.access_token);
        } else if (!newSession) {
          setUser(null);
          localStorage.removeItem('climateshield_token');
          localStorage.removeItem('climateshield_user');
        }
      });

      return () => subscription.unsubscribe();
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    try {
      // Step A: First attempt Express Backend Authentication (verifies Supabase JWT + loads multi-tenant DB profile)
      const offline = await isOfflineMode();
      if (!offline) {
        try {
          const res = await apiRequest<{ success: boolean; token: string; user: AuthUser }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: cleanEmail, password })
          });

          if (res.token && res.user) {
            setUser(res.user);
            localStorage.setItem('climateshield_token', res.token);
            localStorage.setItem('climateshield_user', JSON.stringify(res.user));

            // Sync client Supabase Auth session if configured
            if (isSupabaseConfigured) {
              await supabase.auth.signInWithPassword({ email: cleanEmail, password }).catch(() => {});
            }

            return { success: true };
          }
        } catch (apiErr: any) {
          return {
            success: false,
            error: apiErr.message || 'Authentication failed. Please verify credentials.'
          };
        }
      }

      // Step B: Resilient Demo fallback when running in pure offline demonstration mode
      if (cleanEmail === 'admin@climateshield.demo' && password === 'demo123') {
        const demoUser: AuthUser = {
          id: 'user-elena-vance',
          name: 'Elena Vance',
          email: 'admin@climateshield.demo',
          role: 'OPERATOR',
          organization: 'Amalapuram Municipal Corporation',
          organizationId: 'org-amalapuram-mc',
          primaryJurisdiction: 'Amalapuram Region Operations Command',
          primaryJurisdictionId: 'jur-amalapuram-region',
          authorizedJurisdictions: ['jur-amalapuram-region']
        };
        setUser(demoUser);
        localStorage.setItem('climateshield_token', 'demo-jwt-session-token-climateshield-2024');
        localStorage.setItem('climateshield_user', JSON.stringify(demoUser));
        return { success: true };
      }

      if (cleanEmail === 'operator.tuni@climateshield.demo' && password === 'demo123') {
        const tuniUser: AuthUser = {
          id: 'user-ravi-kumar-tuni',
          name: 'Ravi Kumar',
          email: 'operator.tuni@climateshield.demo',
          role: 'OPERATOR',
          organization: 'Tuni Municipal Corporation',
          organizationId: 'org-tuni-mc',
          primaryJurisdiction: 'Tuni District Operations Command',
          primaryJurisdictionId: 'jur-tuni-district',
          authorizedJurisdictions: ['jur-tuni-district']
        };
        setUser(tuniUser);
        localStorage.setItem('climateshield_token', 'demo-tuni-jwt-session-token');
        localStorage.setItem('climateshield_user', JSON.stringify(tuniUser));
        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid credentials. Use official municipal credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Clear in-memory React state immediately
    setUser(null);
    setSession(null);

    // Clear local storage and session storage
    localStorage.removeItem('climateshield_token');
    localStorage.removeItem('climateshield_user');
    sessionStorage.clear();

    // Terminate Supabase Auth session if configured
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'OPERATOR',
        organization: user?.organization || '',
        primaryJurisdiction: user?.primaryJurisdiction || '',
        primaryJurisdictionId: user?.primaryJurisdictionId || '',
        authorizedJurisdictions: user?.authorizedJurisdictions || [],
        session,
        loading,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
