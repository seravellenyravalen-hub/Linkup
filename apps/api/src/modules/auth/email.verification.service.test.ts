import { describe, expect, it } from 'vitest';
import { EmailVerificationService } from './email.verification.service';

describe('EmailVerificationService', () => {
  it('creates a verification token without storing the raw token', async () => {
    const stored: { tokenHash?: string } = {};

    const service = new EmailVerificationService({
      createToken: async (input) => {
        stored.tokenHash = input.tokenHash;
      },
      verifyTokenAndUser: async () => true,
    });

    const result = await service.create('user-1');

    expect(result.token).toBeTypeOf('string');
    expect(result.token.length).toBeGreaterThan(20);
    expect(stored.tokenHash).toBeTypeOf('string');
    expect(stored.tokenHash).not.toBe(result.token);
  });

  it('verifies a valid token and prevents it from being reused', async () => {
    let consumed = false;

    const service = new EmailVerificationService({
      createToken: async () => {},
      verifyTokenAndUser: async () => {
        if (consumed) return false;
        consumed = true;
        return true;
      },
    });

    await expect(
      service.verify('verification-token'),
    ).resolves.toBe(true);

    await expect(
      service.verify('verification-token'),
    ).resolves.toBe(false);
  });

  it('passes the hashed token to the atomic verification method', async () => {
    let calledWith = '';

    const service = new EmailVerificationService({
      createToken: async () => {},
      verifyTokenAndUser: async (tokenHash) => {
        calledWith = tokenHash;
        return true;
      },
    });

    await expect(
      service.verify('verification-token'),
    ).resolves.toBe(true);

    expect(calledWith).not.toBe('');
    expect(calledWith).not.toBe('verification-token');
  });
});
