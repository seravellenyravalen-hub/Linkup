import * as SecureStore from 'expo-secure-store';
import type { AuthTokens } from './auth-client';

const KEY = 'linkup.auth.tokens.v1';

type StoreAdapter = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  deleteItem(key: string): Promise<void>;
};

export function createAuthStorage(adapter: StoreAdapter = {
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  getItem: (key) => SecureStore.getItemAsync(key),
  deleteItem: (key) => SecureStore.deleteItemAsync(key),
}) {
  return {
    async save(tokens: AuthTokens) {
      await adapter.setItem(KEY, JSON.stringify(tokens));
    },

    async load(): Promise<AuthTokens | null> {
      const raw = await adapter.getItem(KEY);
      if (!raw) return null;

      try {
        const parsed = JSON.parse(raw) as Partial<AuthTokens>;
        if (
          typeof parsed.accessToken !== 'string' ||
          typeof parsed.refreshToken !== 'string'
        ) {
          await adapter.deleteItem(KEY);
          return null;
        }
        return {
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
        };
      } catch {
        await adapter.deleteItem(KEY);
        return null;
      }
    },

    clear() {
      return adapter.deleteItem(KEY);
    },
  };
}
