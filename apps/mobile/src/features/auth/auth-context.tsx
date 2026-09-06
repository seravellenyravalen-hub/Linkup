import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createAuthClient, type AuthTokens } from '@/services/auth-client';
import { createAuthStorage } from '@/services/auth-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';

if (!API_URL) {
  console.warn('LinkUp API is not configured. Set EXPO_PUBLIC_API_URL before using authentication.');
}

const client = createAuthClient(API_URL || 'http://127.0.0.1:3000');
const storage = createAuthStorage();

type AuthContextValue = {
  tokens: AuthTokens | null;
  loading: boolean;
  hydrated: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const saved = await storage.load();
        if (!active) return;

        if (!saved) {
          setTokens(null);
          return;
        }

        try {
          const refreshed = await client.refresh(saved.refreshToken);
          if (!active) return;
          await storage.save(refreshed);
          setTokens(refreshed);
        } catch {
          await storage.clear();
          if (active) setTokens(null);
        }
      } finally {
        if (active) {
          setHydrated(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    tokens,
    loading,
    hydrated,
    async signIn(email, password) {
      setLoading(true);
      try {
        const next = await client.login(email.trim(), password);
        await storage.save(next);
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
        await storage.clear();
        setTokens(null);
        setLoading(false);
      }
    },
  }), [hydrated, loading, tokens]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
