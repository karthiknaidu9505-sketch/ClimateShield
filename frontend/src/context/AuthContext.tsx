import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';
import { MOCK_USER, MOCK_TOKEN, checkDemoCredentials } from '../services/mockData.js';
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
  team?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: string;
  organization: string;
  primaryJurisdiction: string;
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
    // 1. Initial check: Supabase Auth session if configured
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (currentSession?.user) {
          setSession(currentSession);
          setUser({
            id: currentSession.user.id,
            name: currentSession.user.user_metadata?.full_name || 'Operations Officer',
            email: currentSession.user.email || '',
            role: currentSession.user.user_metadata?.role || 'OPERATOR',
            organization: currentSession.user.user_metadata?.organization || 'Amalapuram Municipal Corporation',
            primaryJurisdiction: currentSession.user.user_metadata?.primaryJurisdiction || 'Amalapuram Region'
          });
          localStorage.setItem('climateshield_token', currentSession.access_token);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setUser({
            id: newSession.user.id,
            name: newSession.user.user_metadata?.full_name || 'Operations Officer',
            email: newSession.user.email || '',
            role: newSession.user.user_metadata?.role || 'OPERATOR',
            organization: newSession.user.user_metadata?.organization || 'Amalapuram Municipal Corporation',
            primaryJurisdiction: newSession.user.user_metadata?.primaryJurisdiction || 'Amalapuram Region'
          });
          localStorage.setItem('climateshield_token', newSession.access_token);
        } else {
          setUser(null);
          localStorage.removeItem('climateshield_token');
        }
      });

      return () => subscription.unsubscribe();
    }

    // 2. Demo / offline mode session restoration
    const savedUser = localStorage.getItem('climateshield_user');
    const savedToken = localStorage.getItem('climateshield_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(MOCK_USER as any);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    try {
      // Step A: If Supabase Auth is active, attempt Supabase authentication
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (!error && data.session) {
          const authUser: AuthUser = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || 'Operations Officer',
            email: data.user.email || cleanEmail,
            role: data.user.user_metadata?.role || 'OPERATOR',
            organization: 'Amalapuram Municipal Corporation',
            primaryJurisdiction: 'Amalapuram Region'
          };
          setUser(authUser);
          setSession(data.session);
          localStorage.setItem('climateshield_token', data.session.access_token);
          localStorage.setItem('climateshield_user', JSON.stringify(authUser));
          return { success: true };
        }
      }

      // Step B: If backend is online, attempt backend login endpoint
      const offline = await isOfflineMode();
      if (!offline) {
        try {
          const res = await apiRequest<{ success: boolean; token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: cleanEmail, password })
          });
          if (res.token) {
            setUser(res.user);
            localStorage.setItem('climateshield_token', res.token);
            localStorage.setItem('climateshield_user', JSON.stringify(res.user));
            return { success: true };
          }
        } catch {
          // Fall through to demo credential check
        }
      }

      // Step C: Resilient Demo fallback (preserves offline review)
      if (checkDemoCredentials(cleanEmail, password)) {
        const demoUser: AuthUser = {
          id: 'user-elena-vance',
          name: 'Elena Vance',
          email: 'admin@climateshield.demo',
          role: 'OPERATOR',
          organization: 'Amalapuram Municipal Corporation',
          primaryJurisdiction: 'Amalapuram Region'
        };
        setUser(demoUser);
        localStorage.setItem('climateshield_token', MOCK_TOKEN);
        localStorage.setItem('climateshield_user', JSON.stringify(demoUser));
        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid credentials. Use admin@climateshield.demo / demo123 for demo access.'
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('climateshield_token');
    localStorage.removeItem('climateshield_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'OPERATOR',
        organization: user?.organization || 'Amalapuram Municipal Corporation',
        primaryJurisdiction: user?.primaryJurisdiction || 'Amalapuram Region',
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
