import { describe, expect, it } from 'vitest';
import { createAuthStorage } from './auth-storage';

describe('auth storage', () => {
  it('persists and restores auth tokens', async () => {
    const values = new Map<string, string>();
    const storage = createAuthStorage({
      setItem: async (key, value) => { values.set(key, value); },
      getItem: async (key) => values.get(key) ?? null,
      deleteItem: async (key) => { values.delete(key); },
    });

    const tokens = { accessToken: 'access', refreshToken: 'refresh' };
    await storage.save(tokens);

    await expect(storage.load()).resolves.toEqual(tokens);

    await storage.clear();
    await expect(storage.load()).resolves.toBeNull();
  });
});
