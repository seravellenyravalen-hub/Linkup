import { describe, expect, it } from 'vitest';
import type { Pool } from 'pg';
import { PostgresAuthUserRepository } from './auth.repository';

describe('PostgresAuthUserRepository', () => {
  it('finds a user by normalized email', async () => {
    const query = async () => ({
      rows: [
        {
          id: 'user-1',
          email: 'test@example.com',
          password_hash: 'hash',
          email_verified_at: new Date('2026-09-01T00:00:00Z'),
        },
      ],
    });

    const pool = { query } as unknown as Pool;
    const repository = new PostgresAuthUserRepository(pool);

    const user = await repository.findByEmail('  TEST@EXAMPLE.COM ');

    expect(user).toEqual({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hash',
      emailVerifiedAt: new Date('2026-09-01T00:00:00Z'),
    });
  });

  it('returns null and parameterizes a normalized email when no user exists', async () => {
    let receivedText = '';
    let receivedValues: readonly unknown[] | undefined;

    const query = async (
      text: string,
      values?: readonly unknown[],
    ) => {
      receivedText = text;
      receivedValues = values;
      return { rows: [] };
    };

    const pool = { query } as unknown as Pool;
    const repository = new PostgresAuthUserRepository(pool);

    const user = await repository.findByEmail(
      '  NOUSER@EXAMPLE.COM ',
    );

    expect(user).toBeNull();
    expect(receivedValues).toEqual(['nouser@example.com']);
    expect(receivedText).toContain('WHERE email = $1');
    expect(receivedText).not.toContain('NOUSER@EXAMPLE.COM');
  });
});

describe('create', () => {
  it('creates a user with normalized email and parameterized values', async () => {
    let receivedText = '';
    let receivedValues: readonly unknown[] | undefined;

    const query = async (
      text: string,
      values?: readonly unknown[],
    ) => {
      receivedText = text;
      receivedValues = values;

      return {
        rows: [
          {
            id: 'user-2',
            email: 'new@example.com',
          },
        ],
      };
    };

    const pool = { query } as unknown as Pool;
    const repository = new PostgresAuthUserRepository(pool);

    const user = await repository.create({
      email: '  NEW@EXAMPLE.COM ',
      passwordHash: 'secure-hash',
    });

    expect(user).toEqual({
      id: 'user-2',
      email: 'new@example.com',
    });

    expect(receivedValues).toEqual([
      'new@example.com',
      'secure-hash',
    ]);

    expect(receivedText).toContain(
      'INSERT INTO users (email, password_hash)',
    );
    expect(receivedText).toContain('VALUES ($1, $2)');
    expect(receivedText).not.toContain('NEW@EXAMPLE.COM');
    expect(receivedText).not.toContain('secure-hash');
  });
});
