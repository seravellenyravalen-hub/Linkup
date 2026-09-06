import type { Pool, QueryResultRow } from 'pg';

export type SessionRecord = {
  id: string;
  userId: string;
  tokenFamilyId: string;
  refreshTokenHash: string;
  deviceId: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedBySessionId: string | null;
};

type SessionRow = QueryResultRow & {
  id: string;
  user_id: string;
  token_family_id: string;
  refresh_token_hash: string;
  device_id: string | null;
  expires_at: Date;
  revoked_at: Date | null;
  replaced_by_session_id: string | null;
};

export class SessionRepository {
  constructor(private readonly pool: Pick<Pool, 'query' | 'connect'>) {}

  async create(input: {
    userId: string;
    tokenFamilyId: string;
    refreshTokenHash: string;
    deviceId?: string | null;
    expiresAt: Date;
  }): Promise<{ id: string }> {
    const result = await this.pool.query<{ id: string }>(
      `
        INSERT INTO sessions (
          user_id,
          token_family_id,
          refresh_token_hash,
          device_id,
          expires_at
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [
        input.userId,
        input.tokenFamilyId,
        input.refreshTokenHash,
        input.deviceId ?? null,
        input.expiresAt,
      ],
    );

    return result.rows[0];
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<SessionRecord | null> {
    const result = await this.pool.query<SessionRow>(
      `
        SELECT
          id,
          user_id,
          token_family_id,
          refresh_token_hash,
          device_id,
          expires_at,
          revoked_at,
          replaced_by_session_id
        FROM sessions
        WHERE refresh_token_hash = $1
        LIMIT 1
      `,
      [refreshTokenHash],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.user_id,
      tokenFamilyId: row.token_family_id,
      refreshTokenHash: row.refresh_token_hash,
      deviceId: row.device_id,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
      replacedBySessionId: row.replaced_by_session_id,
    };
  }

  async revoke(sessionId: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE sessions
        SET revoked_at = COALESCE(revoked_at, now())
        WHERE id = $1
      `,
      [sessionId],
    );
  }

  async revokeFamily(tokenFamilyId: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE sessions
        SET revoked_at = COALESCE(revoked_at, now())
        WHERE token_family_id = $1
      `,
      [tokenFamilyId],
    );
  }
    async rotateRefreshToken(
    input: {
      refreshTokenHash: string;
      replacementRefreshTokenHash: string;
      expiresAt: Date;
    },
  ): Promise<{
    id: string;
    userId: string;
    deviceId: string | null;
  }> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query<{
        id: string;
        user_id: string;
        device_id: string | null;
        token_family_id: string;
        expires_at: Date;
        revoked_at: Date | null;
        replaced_by_session_id: string | null;
      }>(
        `
          SELECT
            id,
            user_id,
            device_id,
            token_family_id,
            expires_at,
            revoked_at,
            replaced_by_session_id
          FROM sessions
          WHERE refresh_token_hash = $1
          FOR UPDATE
        `,
        [input.refreshTokenHash],
      );

      const session = result.rows[0];

      if (
        !session ||
        session.revoked_at ||
        new Date(session.expires_at).getTime() <= Date.now()
      ) {
        if (session?.replaced_by_session_id) {
          await client.query(
            `
              UPDATE sessions
              SET revoked_at = COALESCE(revoked_at, now())
              WHERE token_family_id = $1
            `,
            [session.token_family_id],
          );
        }

        throw new Error('Refresh token is expired or revoked');
      }

      const replacement = await client.query<{
        id: string;
        user_id: string;
        device_id: string | null;
      }>(
        `
          INSERT INTO sessions (
            user_id,
            device_id,
            token_family_id,
            refresh_token_hash,
            expires_at
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, user_id, device_id
        `,
        [
          session.user_id,
          session.device_id,
          session.token_family_id,
          input.replacementRefreshTokenHash,
          input.expiresAt,
        ],
      );

      const replacementSessionId = replacement.rows[0].id;

      await client.query(
        `
          UPDATE sessions
          SET
            revoked_at = COALESCE(revoked_at, now()),
            last_used_at = now(),
            replaced_by_session_id = $1
          WHERE id = $2
        `,
        [
          replacementSessionId,
          session.id,
        ],
      );

      await client.query('COMMIT');

      return {
        id: replacement.rows[0].id,
        userId: replacement.rows[0].user_id,
        deviceId: replacement.rows[0].device_id,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async rotate(input: {
    sessionId: string;
    replacementSessionId: string;
  }): Promise<void> {
    await this.pool.query(
      `
        UPDATE sessions
        SET
          revoked_at = COALESCE(revoked_at, now()),
          replaced_by_session_id = $1
        WHERE id = $2
      `,
      [
        input.replacementSessionId,
        input.sessionId,
      ],
    );
  }

}
