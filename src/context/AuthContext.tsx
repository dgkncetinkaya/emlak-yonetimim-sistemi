import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setGlobalLogoutFunction } from '../lib/api';

export type Role = 'admin' | 'consultant';

export interface AuthUser {
  role: Role;
  email: string;
  name?: string;
  token?: string;
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
  isLoading: true,
  login: async () => { throw new Error('AuthProvider not found'); },
  logout: () => { console.error('AuthProvider not found'); }
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

const AUTH_STORAGE_KEY = 'emlak_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted auth
  useEffect(() => {
    console.log('🔍 AuthContext: Loading persisted auth...');
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      console.log('🔍 AuthContext: Raw localStorage data:', raw ? 'EXISTS' : 'NOT FOUND');
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        console.log('🔍 AuthContext: Parsed user data:', parsed);
        console.log('🔍 AuthContext: Has token:', !!parsed.token);
        setUser(parsed);
        console.log('🔍 AuthContext: User set successfully');
      }
    } catch (e) {
      console.error('❌ AuthContext: Failed to read auth from storage', e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      console.log('🔍 AuthContext: Setting isLoading to false');
      setIsLoading(false);
    }
  }, []);

  // Persist auth
  useEffect(() => {
    try {
      if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to write auth to storage', e);
    }
  }, [user]);

  const login: AuthContextType['login'] = async ({ email, password, role }) => {
    console.log('🔍 AuthContext: Demo login attempt started', { email, role });
    
    // Demo mode - basit doğrulama
    if (!email || !password) {
      throw new Error('E-posta ve şifre gereklidir');
    }
    
    // Demo kullanıcı bilgileri
    const demoUsers = {
      'admin@emlak.com': { name: 'Admin Kullanıcı', role: 'admin' as Role },
      'danışman@emlak.com': { name: 'Danışman Kullanıcı', role: 'consultant' as Role }
    };
    
    const userInfo = demoUsers[email as keyof typeof demoUsers];
    
    if (!userInfo || userInfo.role !== role) {
      throw new Error('Geçersiz kullanıcı bilgileri');
    }
    
    // Demo token oluştur
    const demoToken = `demo-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const authed: AuthUser = {
      email,
      role: userInfo.role,
      name: userInfo.name,
      token: demoToken
    };
    
    console.log('✅ AuthContext: Demo login successful, setting user:', authed);
    setUser(authed);
  };

  const logout = () => {
    setUser(null);
    // Redirect to login page after logout
    window.location.href = '/login';
  };

  // Set global logout function for API error handling
  useEffect(() => {
    setGlobalLogoutFunction(logout);
  }, []);

  const isAuthenticated = !!user && !!user.token;
  
  console.log('🔍 AuthContext: Computing auth state:', {
    user: user ? { email: user.email, role: user.role, hasToken: !!user.token } : null,
    isAuthenticated,
    isLoading
  });

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated, isLoading, login, logout }),
    [user, isAuthenticated, isLoading]
  );

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