import type { Pool } from 'pg';

export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt: Date | null;
};

export class PostgresAuthUserRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await this.pool.query<{
      id: string;
      email: string;
      password_hash: string;
      email_verified_at: Date | null;
    }>(
      `
        SELECT id, email, password_hash, email_verified_at
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [normalizedEmail],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      emailVerifiedAt: row.email_verified_at,
    };
  }

  async create(input: {
    email: string;
    passwordHash: string;
  }): Promise<{ id: string; email: string }> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const result = await this.pool.query<{
      id: string;
      email: string;
    }>(
      `
        INSERT INTO users (email, password_hash)
        VALUES ($1, $2)
        RETURNING id, email
      `,
      [normalizedEmail, input.passwordHash],
    );

    return result.rows[0];
  }
}
