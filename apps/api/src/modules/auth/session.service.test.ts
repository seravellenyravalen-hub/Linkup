import { vi } from 'vitest';
import { describe, expect, it } from 'vitest';
import { SessionService } from './session.service';

const SECRET = 'linkup-test-access-token-secret-32chars';
function createRepository() {
  return {
    createSession: async (input: {
      userId: string;
      deviceId?: string;
      refreshTokenHash: string;
      tokenFamilyId: string;
      expiresAt: Date;
    }) => ({
      id: 'session-1',
      userId: input.userId,
      deviceId: input.deviceId ?? null,
    }),
    rotateRefreshToken: async () => ({
      id: 'session-2',
      userId: 'user-1',
      deviceId: null,
    }),
  };
}

describe('SessionService', () => {
  it('creates an opaque refresh token and stores only its hash', async () => {
    const repository = {
      createSession: async (input: {
        userId: string;
        deviceId?: string;
        refreshTokenHash: string;
        tokenFamilyId: string;
        expiresAt: Date;
      }) => {
        expect(input.userId).toBe('user-1');
        expect(input.deviceId).toBe('device-1');
        expect(input.refreshTokenHash).not.toBe('');
        expect(input.refreshTokenHash).not.toContain('refresh-token');
        expect(input.tokenFamilyId).not.toBe('');
        expect(input.expiresAt).toBeInstanceOf(Date);

        return {
          id: 'session-1',
          userId: input.userId,
          deviceId: input.deviceId ?? null,
        };
      },
      rotateRefreshToken: async () => ({ id: 'session-2', userId: 'user-1', deviceId: null }),
    };

    const service = new SessionService(
      repository,
      SECRET,
    );

    const result = await service.create(
      'user-1',
      'device-1',
    );

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.refreshToken).not.toContain('$');
  });

  it('creates an access token with three signed-token sections', async () => {
    const service = new SessionService(
      createRepository(),
      SECRET,
    );

    const result = await service.create('user-1');

    const sections = result.accessToken.split('.');

    expect(sections).toHaveLength(3);
    expect(
      sections.every(
        (section) => section.length > 0,
      ),
    ).toBe(true);
  });


  it('verifies a correctly signed access token', async () => {
    const service = new SessionService(
      createRepository(),
      SECRET,
    );

    const result = await service.create('user-1');

    expect(
      service.verifyAccessToken(result.accessToken),
    ).toEqual({
      sub: 'user-1',
      sid: 'session-1',
    });
  });

  it('rejects an access token with a tampered payload', async () => {
    const service = new SessionService(
      createRepository(),
      SECRET,
    );

    const result = await service.create('user-1');

    const [header, payload, signature] =
      result.accessToken.split('.');

    const tamperedPayload = Buffer.from(
      JSON.stringify({
        sub: 'attacker',
        sid: 'session-1',
        exp: Math.floor(
          (Date.now() + 15 * 60 * 1000) / 1000,
        ),
      }),
    ).toString('base64url');

    const tamperedToken =
      `${header}.${tamperedPayload}.${signature}`;

    expect(() =>
      service.verifyAccessToken(tamperedToken),
    ).toThrow('Invalid access token');
  });

  it('rejects an access token with a tampered signature', async () => {
    const service = new SessionService(
      createRepository(),
      SECRET,
    );

    const result = await service.create('user-1');

    const [header, payload] =
      result.accessToken.split('.');

    const tamperedToken =
      `${header}.${payload}.invalid-signature`;

    expect(() =>
      service.verifyAccessToken(tamperedToken),
    ).toThrow('Invalid access token');
  });

  it('rejects a token signed with a different secret', async () => {
    const issuer = new SessionService(
      createRepository(),
      SECRET,
    );

    const verifier = new SessionService(
      createRepository(),
      'different-linkup-secret-32-characters',
    );

    const result = await issuer.create('user-1');

    expect(() =>
      verifier.verifyAccessToken(result.accessToken),
    ).toThrow('Invalid access token');
  });

  it('rejects an expired access token', async () => {
    const service = new SessionService(
      createRepository(),
      SECRET,
    );

    const result = await service.create('user-1');

    const [header, payload, signature] =
      result.accessToken.split('.');

    const expiredPayload = Buffer.from(
      JSON.stringify({
        sub: 'user-1',
        sid: 'session-1',
        exp: Math.floor(Date.now() / 1000) - 60,
      }),
    ).toString('base64url');

    const expiredToken =
      `${header}.${expiredPayload}.${signature}`;

    expect(() =>
      service.verifyAccessToken(expiredToken),
    ).toThrow('Invalid access token');
  });

  it('rotates a refresh token and returns a new signed token pair', async () => {
    const rotateRefreshToken = vi.fn().mockResolvedValue({
      id: 'replacement-session-1',
      userId: 'user-1',
      deviceId: 'device-1',
    });

    const repository = createRepository();
    repository.rotateRefreshToken = rotateRefreshToken;

    const service = new SessionService(
      repository,
      SECRET,
    );

    const result = await service.refresh(
      'old-refresh-token',
    );

    expect(rotateRefreshToken).toHaveBeenCalledTimes(1);

    const input = rotateRefreshToken.mock.calls[0][0];

    expect(input.refreshTokenHash).not.toBe(
      'old-refresh-token',
    );

    expect(input.replacementRefreshTokenHash).toMatch(
      /^[a-f0-9]{64}$/,
    );

    expect(input.expiresAt).toBeInstanceOf(Date);

    expect(result.refreshToken).toBeTruthy();
    expect(result.refreshToken).not.toBe(
      'old-refresh-token',
    );

    expect(result.accessToken.split('.')).toHaveLength(3);

    expect(
      service.verifyAccessToken(result.accessToken),
    ).toEqual({
      sub: 'user-1',
      sid: 'replacement-session-1',
    });
  });

  it('rejects refresh-token rotation when the repository rejects the token', async () => {
    const repository = createRepository();

    repository.rotateRefreshToken = vi
      .fn()
      .mockRejectedValue(
        new Error('Refresh token is expired or revoked'),
      );

    const service = new SessionService(
      repository,
      SECRET,
    );

    await expect(
      service.refresh('invalid-refresh-token'),
    ).rejects.toThrow(
      'Refresh token is expired or revoked',
    );
  });

  it('rejects an access token secret shorter than 32 characters', () => {
    expect(
      () =>
        new SessionService(
          createRepository(),
          'too-short-secret',
        ),
    ).toThrow(
      'ACCESS_TOKEN_SECRET must be at least 32 characters',
    );
  });

  it('returns a different refresh token each time', async () => {
    const hashes: string[] = [];

    const repository = {
      createSession: async (input: {
        userId: string;
        deviceId?: string;
        refreshTokenHash: string;
        tokenFamilyId: string;
        expiresAt: Date;
      }) => {
        hashes.push(input.refreshTokenHash);

        return {
          id: `session-${hashes.length}`,
          userId: input.userId,
          deviceId: input.deviceId ?? null,
        };
      },
      rotateRefreshToken: async () => ({ id: 'session-2', userId: 'user-1', deviceId: null }),
    };

    const service = new SessionService(
      repository,
      SECRET,
    );

    const first = await service.create('user-1');
    const second = await service.create('user-1');

    expect(first.refreshToken).not.toBe(
      second.refreshToken,
    );

    expect(hashes[0]).not.toBe(hashes[1]);
  });
});
