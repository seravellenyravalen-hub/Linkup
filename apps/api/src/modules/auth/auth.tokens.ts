import { createHash, randomBytes } from 'node:crypto';

export interface OneTimeTokenStore {
  save(input: { userId: string; tokenHash: string; purpose: 'email_verification' | 'password_reset'; expiresAt: Date }): Promise<void>;
  consume(input: { tokenHash: string; purpose: 'email_verification' | 'password_reset' }): Promise<{ userId: string } | null>;
}

const digest = (token: string) => createHash('sha256').update(token).digest('hex');

export class AccountTokenService {
  constructor(private readonly store: OneTimeTokenStore) {}

  async issue(userId: string, purpose: 'email_verification' | 'password_reset', ttlMs: number) {
    const token = randomBytes(32).toString('base64url');
    await this.store.save({ userId, tokenHash: digest(token), purpose, expiresAt: new Date(Date.now() + ttlMs) });
    return token;
  }

  consume(token: string, purpose: 'email_verification' | 'password_reset') {
    return this.store.consume({ tokenHash: digest(token), purpose });
  }
}
