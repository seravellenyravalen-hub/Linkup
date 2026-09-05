import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('rejects duplicate registration by normalized email', async () => {
    const users = { findByEmail: vi.fn().mockResolvedValue({ id: 'existing' }) };
    const service = new AuthService(users as never, {} as never, {} as never);

    await expect(service.register('User@Example.com', 'Strong-password-123')).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('requires a verified account before login succeeds', async () => {
    const users = {
      findByEmail: vi.fn().mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: 'hash',
        emailVerifiedAt: null,
      }),
    };
    const service = new AuthService(users as never, { verify: vi.fn().mockResolvedValue(true) } as never, {} as never);

    await expect(service.login('user@example.com', 'password')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});
