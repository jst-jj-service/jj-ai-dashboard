'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiClient } from './api-client';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
}

export interface QuotaInfo {
  totalTokens: number;
  totalTokensFormatted: string;
  usedTokens: number;
  usedTokensFormatted: string;
  remainingTokens: number;
  remainingTokensFormatted: string;
  cachedTokens: number;
  cachedTokensFormatted: string;
  percentUsed: number;
}

interface AuthContextType {
  user: UserProfile | null;
  quota: QuotaInfo | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  quota: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await ApiClient.auth.getMe();
      if (res.data) {
        setUser(res.data.user);
        setQuota(res.data.quota);
      } else {
        setUser(null);
        setQuota(null);
        ApiClient.clearToken();
      }
    } catch {
      setUser(null);
      setQuota(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (token: string, userProfile: UserProfile) => {
    ApiClient.setToken(token);
    setUser(userProfile);
    refreshUser();
  };

  const logout = () => {
    ApiClient.clearToken();
    setUser(null);
    setQuota(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, quota, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
