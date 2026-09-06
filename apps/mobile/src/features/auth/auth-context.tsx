import { createContext, useContext, useMemo, useState } from 'react';
import { createAuthClient, type AuthTokens } from '@/services/auth-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';

if (!API_URL) {
  console.warn('LinkUp API is not configured. Set EXPO_PUBLIC_API_URL before using authentication.');
}

const client = createAuthClient(API_URL || 'http://127.0.0.1:3000');

type AuthContextValue = {
  tokens: AuthTokens | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(false);

  const value = useMemo<AuthContextValue>(() => ({
    tokens,
    loading,
    async signIn(email, password) {
      setLoading(true);
      try {
        const next = await client.login(email.trim(), password);
        setTokens(next);
      } finally {
        setLoading(false);
      }
    },
    async signOut() {
      if (!tokens) return;
      setLoading(true);
      try {
        await client.logout(tokens.refreshToken);
      } finally {
        setTokens(null);
        setLoading(false);
      }
    },
  }), [loading, tokens]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
