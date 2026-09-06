import {
  createHmac,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const REFRESH_TOKEN_BYTES = 32;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

export interface SessionRepository {
  createSession(input: {
    userId: string;
    deviceId?: string;
    refreshTokenHash: string;
    tokenFamilyId: string;
    expiresAt: Date;
  }): Promise<{
    id: string;
    userId: string;
    deviceId: string | null;
  }>;

  rotateRefreshToken(input: {
    refreshTokenHash: string;
    replacementRefreshTokenHash: string;
    expiresAt: Date;
  }): Promise<{
    id: string;
    userId: string;
    deviceId: string | null;
  }>;
}

export class SessionService {
  private readonly accessTokenSecret: string;

  constructor(
    private readonly repository: SessionRepository,
    accessTokenSecret = process.env.ACCESS_TOKEN_SECRET,
  ) {
    if (!accessTokenSecret || accessTokenSecret.length < 32) {
      throw new Error(
        'ACCESS_TOKEN_SECRET must be at least 32 characters',
      );
    }

    this.accessTokenSecret = accessTokenSecret;
  }

  async create(userId: string, deviceId?: string) {
    const refreshToken = randomBytes(
      REFRESH_TOKEN_BYTES,
    ).toString('base64url');

    const refreshTokenHash = this.hashRefreshToken(
      refreshToken,
    );

    const tokenFamilyId = randomBytes(16).toString('hex');

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_MS,
    );

    const session = await this.repository.createSession({
      userId,
      deviceId,
      refreshTokenHash,
      tokenFamilyId,
      expiresAt,
    });

    const accessToken = this.createAccessToken(
      session.userId,
      session.id,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256')
      .update(token, 'utf8')
      .digest('hex');
  }

  async refresh(refreshToken: string) {
    const replacementRefreshToken = randomBytes(
      REFRESH_TOKEN_BYTES,
    ).toString('base64url');

    const refreshTokenHash =
      this.hashRefreshToken(refreshToken);

    const replacementRefreshTokenHash =
      this.hashRefreshToken(
        replacementRefreshToken,
      );

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_MS,
    );

    const session =
      await this.repository.rotateRefreshToken({
        refreshTokenHash,
        replacementRefreshTokenHash,
        expiresAt,
      });

    const accessToken = this.createAccessToken(
      session.userId,
      session.id,
    );

    return {
      accessToken,
      refreshToken: replacementRefreshToken,
    };
  }

  verifyAccessToken(token: string): {
    sub: string;
    sid: string;
  } {
    try {
      const sections = token.split('.');

      if (sections.length !== 3) {
        throw new Error();
      }

      const [encodedHeader, encodedPayload, encodedSignature] = sections;

      const header = JSON.parse(
        Buffer.from(encodedHeader, 'base64url').toString('utf8'),
      );

      if (
        header?.alg !== 'HS256' ||
        header?.typ !== 'JWT'
      ) {
        throw new Error();
      }

      const expectedSignature = createHmac(
        'sha256',
        this.accessTokenSecret,
      )
        .update(encodedHeader + '.' + encodedPayload)
        .digest();

      const actualSignature = Buffer.from(
        encodedSignature,
        'base64url',
      );

      if (
        actualSignature.length !== expectedSignature.length ||
        !timingSafeEqual(actualSignature, expectedSignature)
      ) {
        throw new Error();
      }

      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      );

      if (
        typeof payload?.sub !== 'string' ||
        typeof payload?.sid !== 'string' ||
        typeof payload?.exp !== 'number' ||
        !Number.isFinite(payload.exp) ||
        payload.exp <= Math.floor(Date.now() / 1000)
      ) {
        throw new Error();
      }

      return {
        sub: payload.sub,
        sid: payload.sid,
      };
    } catch {
      throw new Error('Invalid access token');
    }
  }

  private createAccessToken(
    userId: string,
    sessionId: string,
  ): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload = {
      sub: userId,
      sid: sessionId,
      exp: Math.floor(
        (Date.now() + ACCESS_TOKEN_TTL_MS) / 1000,
      ),
    };

    const encodedHeader = Buffer.from(
      JSON.stringify(header),
    ).toString('base64url');

    const encodedPayload = Buffer.from(
      JSON.stringify(payload),
    ).toString('base64url');

    const signingInput =
      `${encodedHeader}.${encodedPayload}`;

    const signature = createHmac(
      'sha256',
      this.accessTokenSecret,
    )
      .update(signingInput)
      .digest('base64url');

    return `${signingInput}.${signature}`;
  }
}
