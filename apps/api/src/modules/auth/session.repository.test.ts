import { describe, expect, it, vi } from 'vitest';
import { SessionRepository } from './session.repository';

describe('SessionRepository', () => {
  it('stores a session without storing the plaintext refresh token', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [{ id: 'session-1' }],
    });

    const repository = new SessionRepository({ query } as never);

    const result = await repository.create({
      userId: 'user-1',
      tokenFamilyId: 'family-1',
      refreshTokenHash: 'hashed-refresh-token',
      deviceId: 'device-1',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });

    expect(result).toEqual({ id: 'session-1' });
    expect(query).toHaveBeenCalledTimes(1);

    const [sql, values] = query.mock.calls[0];

    expect(sql).toContain('INSERT INTO sessions');
    expect(sql).toContain('token_family_id');
    expect(sql).toContain('refresh_token_hash');
    expect(sql).not.toContain('refreshToken');
    expect(sql).not.toContain('plaintext');

    expect(values).toEqual([
      'user-1',
      'family-1',
      'hashed-refresh-token',
      'device-1',
      new Date('2030-01-01T00:00:00.000Z'),
    ]);
  });

  it('finds a session by refresh-token hash', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          id: 'session-1',
          user_id: 'user-1',
          token_family_id: 'family-1',
          refresh_token_hash: 'hashed-refresh-token',
          device_id: 'device-1',
          expires_at: new Date('2030-01-01T00:00:00.000Z'),
          revoked_at: null,
          replaced_by_session_id: null,
        },
      ],
    });

    const repository = new SessionRepository({ query } as never);

    const result = await repository.findByRefreshTokenHash(
      'hashed-refresh-token',
    );

    expect(result).toEqual({
      id: 'session-1',
      userId: 'user-1',
      tokenFamilyId: 'family-1',
      refreshTokenHash: 'hashed-refresh-token',
      deviceId: 'device-1',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      revokedAt: null,
      replacedBySessionId: null,
    });

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE refresh_token_hash = $1'),
      ['hashed-refresh-token'],
    );
  });

  it('returns null when the refresh-token hash does not exist', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });

    const repository = new SessionRepository({ query } as never);

    await expect(
      repository.findByRefreshTokenHash('missing-hash'),
    ).resolves.toBeNull();
  });
});

  it('revokes a specific session', async () => {
    const query = vi.fn().mockResolvedValue({
      rowCount: 1,
    });

    const repository = new SessionRepository({ query } as never);

    await repository.revoke('session-1');

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE sessions'),
      ['session-1'],
    );

    const [sql] = query.mock.calls[0];
    expect(sql).toContain('revoked_at');
    expect(sql).toContain('WHERE id = $1');
  });

  it('revokes an entire refresh-token family', async () => {
    const query = vi.fn().mockResolvedValue({
      rowCount: 2,
    });

    const repository = new SessionRepository({ query } as never);

    await repository.revokeFamily('family-1');

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE sessions'),
      ['family-1'],
    );

    const [sql] = query.mock.calls[0];
    expect(sql).toContain('revoked_at');
    expect(sql).toContain('WHERE token_family_id = $1');
  });

  it('rotates a session by revoking the old session and linking its replacement', async () => {
    const query = vi.fn().mockResolvedValue({ rowCount: 1 });
    const repository = new SessionRepository({ query } as never);

    await repository.rotate({
      sessionId: 'session-1',
      replacementSessionId: 'replacement-1',
    });

    expect(query).toHaveBeenCalledTimes(1);

    const [sql, values] = query.mock.calls[0];

    expect(sql).toContain('UPDATE sessions');
    expect(sql).toContain('revoked_at');
    expect(sql).toContain('replaced_by_session_id');
    expect(values).toEqual([
      'replacement-1',
      'session-1',
    ]);
  });

describe('atomic refresh-token rotation', () => {
  it('rotates a valid session atomically and returns the replacement token', async () => {
    const query = vi.fn();
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({
          rows: [{
            id: 'session-1',
            user_id: 'user-1',
            token_family_id: 'family-1',
            expires_at: new Date(Date.now() + 60_000),
            revoked_at: null,
          }],
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'replacement-session-1',
          }],
        })
        .mockResolvedValue(undefined),
      release: vi.fn(),
    };

    const pool = {
      connect: vi.fn().mockResolvedValue(client),
      query,
    };

    const repository = new SessionRepository(pool as never);

    await repository.rotateRefreshToken({
      refreshTokenHash: 'refresh-token-1',
      replacementRefreshTokenHash: 'replacement-hash-1',
      expiresAt: new Date(Date.now() + 60_000),
    });

    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith('BEGIN');

    const statements = client.query.mock.calls.map(
      ([sql]) => String(sql),
    );

    expect(
      statements.some((sql) => sql.includes('FOR UPDATE')),
    ).toBe(true);
  });
});


describe('atomic refresh-token rotation security', () => {
  it('rejects an expired or revoked refresh-token session', async () => {
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({
          rows: [{
            id: 'session-1',
            user_id: 'user-1',
            token_family_id: 'family-1',
            expires_at: new Date(Date.now() - 1000),
            revoked_at: null,
          }],
        }),
      release: vi.fn(),
    };

    const pool = {
      connect: vi.fn().mockResolvedValue(client),
      query: vi.fn(),
    };

    const repository = new SessionRepository(pool as never);

    await expect(
      repository.rotateRefreshToken({ refreshTokenHash: 'refresh-hash-1', replacementRefreshTokenHash: 'replacement-hash-1', expiresAt: new Date(Date.now() + 60_000) }),
    ).rejects.toThrow('Refresh token is expired or revoked');

    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalledTimes(1);
  });
});


describe('refresh-token replay protection', () => {
  it('does not revoke the token family when an ordinary expired token is rejected', async () => {
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({
          rows: [{
            id: 'session-expired',
            user_id: 'user-1',
            device_id: null,
            token_family_id: 'family-1',
            expires_at: new Date(Date.now() - 60_000),
            revoked_at: null,
            replaced_by_session_id: null,
          }],
        })
        .mockResolvedValueOnce(undefined),
      release: vi.fn(),
    };

    const pool = {
      connect: vi.fn().mockResolvedValue(client),
    };

    const repository = new SessionRepository(pool as never);

    await expect(
      repository.rotateRefreshToken({
        refreshTokenHash: 'expired-hash',
        replacementRefreshTokenHash: 'replacement-hash',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }),
    ).rejects.toThrow('Refresh token is expired or revoked');

    const queries = client.query.mock.calls.map(([query]) => String(query));

    expect(
      queries.some(
        (query) =>
          query.includes('UPDATE sessions') &&
          query.includes('token_family_id'),
      ),
    ).toBe(false);
  });

  it('preserves the device when creating a replacement session', async () => {
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({
          rows: [{
            id: 'session-1',
            user_id: 'user-1',
            device_id: 'device-1',
            token_family_id: 'family-1',
            expires_at: new Date(Date.now() + 60_000),
            revoked_at: null,
            replaced_by_session_id: null,
          }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: 'replacement-session-1' }],
        })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined),
      release: vi.fn(),
    };

    const pool = {
      connect: vi.fn().mockResolvedValue(client),
    };

    const repository = new SessionRepository(pool as never);

    await repository.rotateRefreshToken({
      refreshTokenHash: 'refresh-hash',
      replacementRefreshTokenHash: 'replacement-hash',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const insertCall = client.query.mock.calls.find(([query]) =>
      String(query).includes('INSERT INTO sessions'),
    );

    expect(insertCall).toBeTruthy();

    const values = insertCall?.[1];

    expect(values).toContain('user-1');
    expect(values).toContain('device-1');
    expect(values).toContain('family-1');
    expect(values).toContain('replacement-hash');
  });

  it('revokes the token family when a replaced refresh token is replayed', async () => {
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({
          rows: [{
            id: 'session-replayed',
            user_id: 'user-1',
            device_id: 'device-1',
            token_family_id: 'family-1',
            expires_at: new Date(Date.now() + 60_000),
            revoked_at: new Date(),
            replaced_by_session_id: 'replacement-session-1',
          }],
        })
        .mockResolvedValueOnce(undefined),
      release: vi.fn(),
    };

    const pool = {
      connect: vi.fn().mockResolvedValue(client),
    };

    const repository = new SessionRepository(pool as never);

    await expect(
      repository.rotateRefreshToken({
        refreshTokenHash: 'replayed-hash',
        replacementRefreshTokenHash: 'replacement-hash',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }),
    ).rejects.toThrow('Refresh token is expired or revoked');

    const queries = client.query.mock.calls.map(([query]) => String(query));

    expect(
      queries.some(
        (query) =>
          query.includes('UPDATE sessions') &&
          query.includes('token_family_id'),
      ),
    ).toBe(true);
  });
});

describe('atomic refresh-token replacement', () => {
  it('creates a replacement session and links the old session', async () => {
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({
          rows: [{
            id: 'session-1',
            user_id: 'user-1',
            token_family_id: 'family-1',
            expires_at: new Date(Date.now() + 60_000),
            revoked_at: null,
          }],
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'replacement-session-1',
          }],
        })
        .mockResolvedValue(undefined),
      release: vi.fn(),
    };

    const pool = {
      connect: vi.fn().mockResolvedValue(client),
      query: vi.fn(),
    };

    const repository = new SessionRepository(pool as never);

    await repository.rotateRefreshToken({
      refreshTokenHash: 'refresh-hash-1',
      replacementRefreshTokenHash: 'replacement-hash-1',
      expiresAt: new Date(Date.now() + 60_000),
    });

    const statements = client.query.mock.calls.map(
      ([sql]) => String(sql),
    );

    const insertCall = client.query.mock.calls.find(
      ([sql]) => String(sql).includes('INSERT INTO sessions'),
    );

    expect(insertCall).toBeDefined();

    const insertSql = String(insertCall?.[0]);
    const insertValues = insertCall?.[1] as unknown[] | undefined;

    expect(insertSql).toContain('INSERT INTO sessions');
    expect(insertSql).toContain('token_family_id');
    expect(insertValues).toContain('user-1');
    expect(insertValues).toContain('family-1');
    expect(insertValues).toContain('replacement-hash-1');
    expect(
      insertValues?.some(
        (value) => value instanceof Date,
      ),
    ).toBe(true);

    const linkCall = client.query.mock.calls.find(
      ([sql]) => String(sql).includes('replaced_by_session_id'),
    );

    expect(linkCall).toBeDefined();
  });
});
