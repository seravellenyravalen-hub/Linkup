type EmailVerificationDatabase = {
  query(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: any[] }>;

  connect?(): Promise<{
    query(
      text: string,
      values?: readonly unknown[],
    ): Promise<{ rows: any[] }>;
    release(): void;
  }>;
};

export class PostgresEmailVerificationTokenRepository {
  constructor(
    private readonly pool: EmailVerificationDatabase,
  ) {}

  async createToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO email_verification_tokens (
          user_id,
          token_hash,
          expires_at
        )
        VALUES ($1, $2, $3)
      `,
      [
        input.userId,
        input.tokenHash,
        input.expiresAt,
      ],
    );
  }

  async verifyTokenAndUser(
    tokenHash: string,
  ): Promise<boolean> {
    if (!this.pool.connect) {
      throw new Error(
        'Database connection is required for atomic verification',
      );
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `
          UPDATE email_verification_tokens
          SET used_at = now()
          WHERE token_hash = $1
            AND used_at IS NULL
            AND expires_at > now()
          RETURNING user_id
        `,
        [tokenHash],
      );

      const userId = result.rows[0]?.user_id;

      if (!userId) {
        await client.query('ROLLBACK');
        return false;
      }

      await client.query(
        `
          UPDATE users
          SET
            email_verified_at = COALESCE(email_verified_at, now()),
            updated_at = now()
          WHERE id = $1
        `,
        [userId],
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async markUserEmailVerified(
    userId: string,
  ): Promise<void> {
    await this.pool.query(
      `
        UPDATE users
        SET
          email_verified_at = COALESCE(email_verified_at, now()),
          updated_at = now()
        WHERE id = $1
      `,
      [userId],
    );
  }

  async consumeToken(
    tokenHash: string,
  ): Promise<boolean> {
    const result = await this.pool.query(
      `
        UPDATE email_verification_tokens
        SET used_at = now()
        WHERE token_hash = $1
          AND used_at IS NULL
          AND expires_at > now()
        RETURNING id
      `,
      [tokenHash],
    );

    return result.rows.length > 0;
  }
}
