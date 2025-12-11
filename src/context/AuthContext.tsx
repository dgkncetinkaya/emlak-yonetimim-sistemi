import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase, signInWithEmail, signOut, getCurrentUser, getSession, UserProfile } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export type Role = 'admin' | 'consultant';

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  name?: string;
  full_name?: string;
  token?: string;
  isSubUser?: boolean;
  parentUserId?: string;
  companyName?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  permissions?: Record<string, any>;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: { email: string; password: string; role: Role }) => Promise<void>;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => { throw new Error('AuthProvider not found'); },
  logout: () => { console.error('AuthProvider not found'); }
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to create AuthUser from session and profile
  const createAuthUser = useCallback((session: Session, profile: any): AuthUser => {
    return {
      id: session.user.id,
      email: session.user.email!,
      role: profile.role as Role,
      name: profile.full_name || undefined,
      full_name: profile.full_name || undefined,
      token: session.access_token,
      isSubUser: profile.is_sub_user || false,
      parentUserId: profile.parent_user_id || undefined,
      companyName: profile.company_name || undefined,
      phone: profile.phone || undefined,
      avatar_url: profile.avatar_url || undefined,
      created_at: profile.created_at || session.user.created_at || undefined,
      permissions: profile.permissions || {}
    };
  }, []);

  // Helper function to fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log('AuthContext: Fetching profile for user:', userId);
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('AuthContext: Profile fetch error:', profileError);
      console.log('AuthContext: Creating default profile for user');
      
      // Return default profile if not found
      return {
        id: userId,
        role: 'consultant',
        full_name: null,
        company_name: null,
        phone: null,
        is_sub_user: false,
        parent_user_id: null,
        permissions: {}
      };
    }
    
    console.log('AuthContext: Profile fetched successfully:', profile);
    return profile;
  }, []);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      if (!isMounted) return;
      
      console.log('AuthContext: Initializing...');
      
      try {
        // First check localStorage for saved user data
        const savedUser = localStorage.getItem('emlak_auth_user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            console.log('AuthContext: Found saved user in localStorage:', parsedUser.email);
            setUser(parsedUser);
          } catch (error) {
            console.error('AuthContext: Error parsing saved user:', error);
            localStorage.removeItem('emlak_auth_user');
          }
        }
        
        // Check current Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Session check error:', error);
          // Clear localStorage if session is invalid
          localStorage.removeItem('emlak_auth_user');
          setUser(null);
        } else if (session?.user) {
          console.log('AuthContext: Valid session found for user:', session.user.email);
          
          // Fetch user profile
          const profile = await fetchUserProfile(session.user.id);
          const authUser = createAuthUser(session, profile);
          
          // Save to localStorage and state
          localStorage.setItem('emlak_auth_user', JSON.stringify(authUser));
          setUser(authUser);
          console.log('AuthContext: User restored from session');
        } else {
          console.log('AuthContext: No valid session found');
          // Clear localStorage if no session
          localStorage.removeItem('emlak_auth_user');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
        localStorage.removeItem('emlak_auth_user');
        setUser(null);
      }
      
      if (isMounted) {
        console.log('AuthContext: Setting isInitialized to true');
        setIsInitialized(true);
        console.log('AuthContext: Initialization complete');
      }
    };
    
    // Use setTimeout to ensure this runs after component mount
    const timeoutId = setTimeout(initializeAuth, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [createAuthUser, fetchUserProfile]);

  const login: AuthContextType['login'] = useCallback(async ({ email, password, role }) => {
    console.log('AuthContext: Login attempt started', { email, role });
    
    if (!email || !password) {
      throw new Error('E-posta ve şifre gereklidir');
    }
    
    setIsLoading(true);
    
    try {
      // Supabase ile giriş yap
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        console.error('AuthContext: Supabase login error:', error);
        throw new Error(error.message || 'Giriş başarısız');
      }
      
      if (!data.user || !data.session) {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }
      
      console.log('AuthContext: Login successful - user:', data.user.email);
      
      // Kullanıcı profilini al
      const profile = await fetchUserProfile(data.user.id);
      
      // Rol kontrolü
      if (profile.role !== role) {
        throw new Error('Seçilen rol ile kullanıcı rolü uyuşmuyor');
      }
      
      const authUser = createAuthUser(data.session, profile);
      console.log('AuthContext: Login successful, setting user:', authUser);
      
      // Save to localStorage for persistence
      localStorage.setItem('emlak_auth_user', JSON.stringify(authUser));
      setUser(authUser);
      
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile, createAuthUser]);

  const logout = useCallback(async () => {
    try {
      console.log('AuthContext: Logout started');
      const { error } = await signOut();
      if (error) {
        console.error('AuthContext: Logout error:', error);
      }
      
      // Clear localStorage
      localStorage.removeItem('emlak_auth_user');
      setUser(null);
      console.log('AuthContext: Logout completed');
      // Redirect to login page after logout
      window.location.href = '/login';
    } catch (error) {
      console.error('AuthContext: Logout failed:', error);
      // Clear localStorage even on error
      localStorage.removeItem('emlak_auth_user');
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  // Global logout function is no longer needed since we're using Supabase directly

  const isAuthenticated = !!user && !!user.token;

  // Show loading only during login process, not during initialization
  const shouldShowLoading = isLoading;

  const value = useMemo<AuthContextType>(
    () => ({ 
      user, 
      isAuthenticated, 
      isLoading: shouldShowLoading, 
      login, 
      logout 
    }),
    [user, isAuthenticated, shouldShowLoading, login, logout]
  );

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <AuthContext.Provider value={value}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #e3e3e3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#666', fontSize: '16px' }}>Uygulama başlatılıyor...</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx || ctx === defaultAuthContext) {
    console.warn('useAuth called outside of AuthProvider, returning default context');
    return defaultAuthContext;
  }
  return ctx;
};