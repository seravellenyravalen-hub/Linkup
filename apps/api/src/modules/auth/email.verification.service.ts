import { createHash, randomBytes } from 'node:crypto';

export interface EmailVerificationTokenRepository {
  createToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;

  verifyTokenAndUser(tokenHash: string): Promise<boolean>;
}

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 30 * 60 * 1000;

export class EmailVerificationService {
  constructor(
    private readonly repository: EmailVerificationTokenRepository,
  ) {}

  async create(userId: string) {
    const token = randomBytes(TOKEN_BYTES).toString('base64url');

    const tokenHash = createHash('sha256')
      .update(token, 'utf8')
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + TOKEN_TTL_MS,
    );

    await this.repository.createToken({
      userId,
      tokenHash,
      expiresAt,
    });

    return { token };
  }

  async verify(token: string): Promise<boolean> {
    const tokenHash = createHash('sha256')
      .update(token, 'utf8')
      .digest('hex');

    return this.repository.verifyTokenAndUser(tokenHash);
  }
}
