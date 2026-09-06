import { describe, expect, it } from 'vitest';
import { PostgresEmailVerificationTokenRepository } from './email.verification.repository';

describe('PostgresEmailVerificationTokenRepository', () => {
  it('stores only the token hash with an expiry', async () => {
    const calls: Array<{
      text: string;
      values: readonly unknown[];
    }> = [];

    const pool = {
      query: async (text: string, values?: readonly unknown[]) => {
        calls.push({ text, values: values ?? [] });
        return { rows: [] };
      },
    };

    const repository =
      new PostgresEmailVerificationTokenRepository(pool);

    const expiresAt = new Date('2026-09-05T23:00:00.000Z');

    await repository.createToken({
      userId: 'user-1',
      tokenHash: 'hashed-token',
      expiresAt,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].text).toContain('email_verification_tokens');
    expect(calls[0].values).toEqual([
      'user-1',
      'hashed-token',
      expiresAt,
    ]);
    expect(calls[0].values).not.toContain('raw-token');
  });
});

  it('consumes an unused and unexpired token atomically', async () => {
    const calls: Array<{
      text: string;
      values: readonly unknown[];
    }> = [];

    const pool = {
      query: async (text: string, values?: readonly unknown[]) => {
        calls.push({ text, values: values ?? [] });
        return { rows: [{ id: 'token-1' }] };
      },
    };

    const repository =
      new PostgresEmailVerificationTokenRepository(pool);

    const result = await repository.consumeToken('hashed-token');

    expect(result).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].text).toContain('UPDATE email_verification_tokens');
    expect(calls[0].text).toContain('used_at');
    expect(calls[0].text).toContain('expires_at');
    expect(calls[0].text).toContain('used_at IS NULL');
    expect(calls[0].values).toEqual(['hashed-token']);
  });

  it('marks the user email as verified', async () => {
    const calls: Array<{
      text: string;
      values: readonly unknown[];
    }> = [];

    const pool = {
      query: async (text: string, values?: readonly unknown[]) => {
        calls.push({ text, values: values ?? [] });
        return { rows: [] };
      },
    };

    const repository =
      new PostgresEmailVerificationTokenRepository(pool);

    await repository.markUserEmailVerified('user-1');

    expect(calls).toHaveLength(1);
    expect(calls[0].text).toContain(
      'UPDATE users',
    );
    expect(calls[0].text).toContain(
      'email_verified_at',
    );
    expect(calls[0].values).toEqual(['user-1']);
  });

  it('atomically consumes the token and verifies the user', async () => {
    const calls: string[] = [];

    const client = {
      query: async (text: string, values?: readonly unknown[]) => {
        calls.push(text);

        if (text.includes('UPDATE email_verification_tokens')) {
          return { rows: [{ user_id: 'user-1' }] };
        }

        return { rows: [] };
      },
      release: () => {},
    };

    const pool = {
      query: async () => ({ rows: [] }),
      connect: async () => client,
    };

    const repository =
      new PostgresEmailVerificationTokenRepository(pool);

    await repository.verifyTokenAndUser('token-hash');

    expect(calls[0]).toContain('BEGIN');
    expect(calls.some((text) =>
      text.includes('UPDATE email_verification_tokens'),
    )).toBe(true);
    expect(calls.some((text) =>
      text.includes('UPDATE users'),
    )).toBe(true);
    expect(calls[calls.length - 1]).toContain('COMMIT');
  });
