import { describe, expect, it } from 'vitest';
import { AuthError, AuthService } from './auth.service';

describe('AuthService', () => {
  it('rejects registration when the normalized email already exists', async () => {
    const users = new Map<string, { id: string; email: string; passwordHash: string; emailVerifiedAt: Date | null }>();

    const service = new AuthService(
      {
        findByEmail: async (email) => users.get(email) ?? null,
        create: async (input) => {
          const user = {
            id: 'user-1',
            email: input.email,
            passwordHash: input.passwordHash,
            emailVerifiedAt: null,
          };
          users.set(input.email, user);
          return user;
        },
      },
      {
        hash: async () => 'hashed-password',
        verify: async () => true,
      },
      {
        create: async () => ({
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        }),
      },
    );

    await service.register(' Test@Example.com ', 'correct horse battery staple');

    await expect(
      service.register('test@example.com', 'another correct password'),
    ).rejects.toMatchObject<AuthError>({
      code: 'CONFLICT',
    });
  });

  it('requires a verified email before login succeeds', async () => {
    const service = new AuthService(
      {
        findByEmail: async () => ({
          id: 'user-1',
          email: 'test@example.com',
          passwordHash: 'hash',
          emailVerifiedAt: null,
        }),
        create: async () => {
          throw new Error('not used');
        },
      },
      {
        hash: async () => 'hash',
        verify: async () => true,
      },
      {
        create: async () => ({
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        }),
      },
    );

    await expect(
      service.login('test@example.com', 'correct horse battery staple'),
    ).rejects.toMatchObject<AuthError>({
      code: 'FORBIDDEN',
    });
  });
});
