import { AuthError } from '../modules/auth/auth.errors';

export class HttpRequestError extends Error {
  readonly code = 'INVALID_REQUEST' as const;

  constructor(message: string) {
    super(message);
    this.name = 'HttpRequestError';
  }
}

export function statusForError(error: unknown): number {
  if (error instanceof HttpRequestError) {
    return 400;
  }

  if (error instanceof AuthError) {
    switch (error.code) {
      case 'INVALID_REQUEST':
        return 400;
      case 'CONFLICT':
        return 409;
      case 'UNAUTHENTICATED':
        return 401;
      case 'FORBIDDEN':
        return 403;
    }
  }

  return 500;
}

export function errorResponse(error: unknown): Response {
  const status = statusForError(error);

  if (error instanceof HttpRequestError) {
    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
        },
      }),
      {
        status,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }

  if (error instanceof AuthError) {
    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
        },
      }),
      {
        status,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }

  return new Response(
    JSON.stringify({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    }),
    {
      status: 500,
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}
