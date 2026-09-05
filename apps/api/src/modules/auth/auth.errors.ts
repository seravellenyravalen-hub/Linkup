export class AuthError extends Error {
  constructor(
    public readonly code: 'INVALID_REQUEST' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'CONFLICT' | 'RATE_LIMITED',
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
