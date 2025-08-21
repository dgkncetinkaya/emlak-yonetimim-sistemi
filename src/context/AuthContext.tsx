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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Giriş başarısız');
    }
    const data = await res.json();
    const authed: AuthUser = { email: data.user.email, role: data.user.role, name: data.user.name, token: data.token };
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};