import { AuthError } from './auth.errors';
import { EmailVerificationService } from './email.verification.service';

export interface AuthUserRepository {
  findByEmail(email: string): Promise<{
    id: string;
    email: string;
    passwordHash: string;
    emailVerifiedAt: Date | null;
  } | null>;

  create(input: {
    email: string;
    passwordHash: string;
  }): Promise<{
    id: string;
    email: string;
  }>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(hash: string, password: string): Promise<boolean>;
}

export interface SessionService {
  create(
    userId: string,
    deviceId?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  rotate(
    refreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  revoke(refreshToken: string): Promise<void>;
}

const normalizeEmail = (email: string) =>
  email.trim().toLowerCase();

export class AuthService {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly passwords: PasswordHasher,
    private readonly sessions: SessionService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  async register(email: string, password: string) {
    const normalizedEmail = normalizeEmail(email);

    if (
      !normalizedEmail ||
      !normalizedEmail.includes('@') ||
      password.length < 12
    ) {
      throw new AuthError(
        'INVALID_REQUEST',
        'Invalid registration details',
      );
    }

    if (await this.users.findByEmail(normalizedEmail)) {
      throw new AuthError(
        'CONFLICT',
        'An account already exists for this email',
      );
    }

    const passwordHash = await this.passwords.hash(password);

    const user = await this.users.create({
      email: normalizedEmail,
      passwordHash,
    });

    await this.emailVerification.create(user.id);

    return user;
  }

  async verifyEmail(token: string): Promise<boolean> {
    return this.emailVerification.verify(token);
  }

  async login(
    email: string,
    password: string,
    deviceId?: string,
  ) {
    const user = await this.users.findByEmail(
      normalizeEmail(email),
    );

    if (
      !user ||
      !(await this.passwords.verify(
        user.passwordHash,
        password,
      ))
    ) {
      throw new AuthError(
        'UNAUTHENTICATED',
        'Invalid email or password',
      );
    }

    if (!user.emailVerifiedAt) {
      throw new AuthError(
        'FORBIDDEN',
        'Email verification is required before signing in',
      );
    }

    return this.sessions.create(user.id, deviceId);
  }

  refresh(refreshToken: string) {
    return this.sessions.rotate(refreshToken);
  }

  logout(refreshToken: string) {
    return this.sessions.revoke(refreshToken);
  }
}