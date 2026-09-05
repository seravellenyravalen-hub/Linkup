import { createHash, randomBytes } from 'node:crypto';

export interface SessionRepository {
  create(input: { userId: string; deviceId?: string; refreshTokenHash: string; expiresAt: Date }): Promise<void>;
  consumeActive(refreshTokenHash: string): Promise<{ id: string; userId: string } | null>;
  revoke(id: string): Promise<void>;
}

export interface AccessTokenIssuer {
  issue(userId: string): Promise<string>;
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export class SessionService {
  constructor(private readonly repository: SessionRepository, private readonly issuer: AccessTokenIssuer) {}

  async create(userId: string, deviceId?: string) {
    const refreshToken = randomBytes(48).toString('base64url');
    await this.repository.create({
      userId,
      deviceId,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return { accessToken: await this.issuer.issue(userId), refreshToken };
  }

  async rotate(refreshToken: string) {
    const current = await this.repository.consumeActive(hashToken(refreshToken));
    if (!current) throw new Error('Invalid or expired refresh token');
    await this.repository.revoke(current.id);
    return this.create(current.userId);
  }

  async revoke(refreshToken: string) {
    const current = await this.repository.consumeActive(hashToken(refreshToken));
    if (current) await this.repository.revoke(current.id);
  }
}
