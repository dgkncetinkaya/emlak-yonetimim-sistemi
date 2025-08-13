import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
  login: (params: { email: string; password: string; role: Role }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'emlak_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load persisted auth
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        setUser(parsed);
      }
    } catch (e) {
      console.error('Failed to read auth from storage', e);
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
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated: !!user?.token, login, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};