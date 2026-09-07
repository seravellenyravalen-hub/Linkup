import { databasePool } from '../../database/database.pool';
import { AuthController } from './auth.controller';
import { PostgresAuthUserRepository } from './auth.repository';
import { EmailVerificationService } from './email.verification.service';
import { PostgresEmailVerificationTokenRepository } from './email.verification.repository';
import { PasswordHasher } from './password.hasher';
import { SessionRepository } from './session.repository';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';

export function createAuthController() {
  const users = new PostgresAuthUserRepository(databasePool);
  const passwords = new PasswordHasher();
  const sessionsRepository = new SessionRepository(databasePool);
  const sessions = new SessionService({
    createSession: async (input) => {
      const session = await sessionsRepository.create(input);
      return {
        id: session.id,
        userId: input.userId,
        deviceId: input.deviceId ?? null,
      };
    },
    rotateRefreshToken: (input) => sessionsRepository.rotateRefreshToken(input),
    revoke: (sessionId) => sessionsRepository.revoke(sessionId),
  });
  const emailVerification = new EmailVerificationService(
    new PostgresEmailVerificationTokenRepository(databasePool),
  );
  const service = new AuthService(users, passwords, sessions, emailVerification);

  return new AuthController(service);
}
