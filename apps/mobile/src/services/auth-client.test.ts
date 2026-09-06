import { describe, expect, it, vi } from 'vitest';
import { createAuthClient } from './auth-client';

describe('auth client', () => {
  it('returns tokens from a successful login', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ accessToken: 'a', refreshToken: 'r' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    await expect(
      createAuthClient('https://api.example.com', fetcher).login('a@b.com', 'password123456'),
    ).resolves.toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('surfaces the API error message', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: 'Invalid email or password' } }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      ),
    );

    await expect(
      createAuthClient('https://api.example.com', fetcher).login('a@b.com', 'wrong'),
    ).rejects.toThrow('Invalid email or password');
  });
});
