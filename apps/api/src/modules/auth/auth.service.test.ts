import { describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const sessions = {
    create: async () => ({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }),
    rotate: async () => ({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }),
    revoke: async () => {},
  };

  const verificationEmail = {
    send: async () => {},
  };

  it('rejects registration when the normalized email already exists', async () => {
    const users = new Map<string, { id: string; email: string; passwordHash: string; emailVerifiedAt: Date | null }>();

    const service = new AuthService(
      {
        findByEmail: async (email) => users.get(email) ?? null,
        create: async (input) => {
          const user = { id: 'user-1', email: input.email, passwordHash: input.passwordHash, emailVerifiedAt: null };
          users.set(input.email, user);
          return user;
        },
      },
      { hash: async () => 'hashed-password', verify: async () => true },
      sessions,
      { create: async () => ({ token: 'verification-token' }), verify: async () => false },
      verificationEmail,
    );

    await service.register(' Test@Example.com ', 'correct horse battery staple');
    await expect(service.register('test@example.com', 'another correct password')).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('requires a verified email before login succeeds', async () => {
    const service = new AuthService(
      {
        findByEmail: async () => ({ id: 'user-1', email: 'test@example.com', passwordHash: 'hash', emailVerifiedAt: null }),
        create: async () => { throw new Error('not used'); },
      },
      { hash: async () => 'hash', verify: async () => true },
      sessions,
      { create: async () => ({ token: 'verification-token' }), verify: async () => false },
      verificationEmail,
    );

    await expect(service.login('test@example.com', 'correct horse battery staple')).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('creates and sends an email verification token after registration', async () => {
    let verificationUserId = '';
    let sentEmail = '';
    let sentToken = '';

    const service = new AuthService(
      {
        findByEmail: async () => null,
        create: async (input) => ({ id: 'user-1', email: input.email, passwordHash: input.passwordHash, emailVerifiedAt: null }),
      },
      { hash: async () => 'hashed-password', verify: async () => true },
      sessions,
      {
        create: async (userId) => { verificationUserId = userId; return { token: 'verification-token' }; },
        verify: async () => false,
      },
      {
        send: async ({ email, token }) => { sentEmail = email; sentToken = token; },
      },
    );

    const user = await service.register('test@example.com', 'correct horse battery staple');

    expect(user.email).toBe('test@example.com');
    expect(verificationUserId).toBe('user-1');
    expect(sentEmail).toBe('test@example.com');
    expect(sentToken).toBe('verification-token');
  });

  it('verifies an email using the verification token', async () => {
    let receivedToken = '';
    const service = new AuthService(
      {
        findByEmail: async () => null,
        create: async () => { throw new Error('not used'); },
      },
      { hash: async () => 'hash', verify: async () => true },
      sessions,
      {
        create: async () => ({ token: 'verification-token' }),
        verify: async (token) => { receivedToken = token; return true; },
      },
      verificationEmail,
    );

    const verified = await service.verifyEmail('verification-token');
    expect(verified).toBe(true);
    expect(receivedToken).toBe('verification-token');
  });
});
