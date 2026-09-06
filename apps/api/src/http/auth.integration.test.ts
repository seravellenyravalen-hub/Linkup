import { describe, expect, it } from 'vitest';
import { createHttpServer } from './server';

describe('HTTP auth integration', () => {
  it('registers a user through POST /api/v1/auth/register', async () => {
    const server = createHttpServer({
      authController: {
        register: async () =>
          new Response(
            JSON.stringify({
              user: {
                id: 'user-1',
                email: 'integration@example.com',
              },
            }),
            {
              status: 201,
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        verifyEmail: async () => new Response(null, { status: 200 }),
        login: async () => new Response(null, { status: 200 }),
        refresh: async () => new Response(null, { status: 200 }),
        logout: async () => new Response(null, { status: 204 }),
      },
    });

    const { port } = await server.start(0);

    try {
      const response = await fetch(
        `http://127.0.0.1:${port}/api/v1/auth/register`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            email: 'integration@example.com',
            password: 'a-strong-password-123',
          }),
        },
      );

      expect(response.status).toBe(201);

      const body = await response.json();

      expect(body.user.email).toBe(
        'integration@example.com',
      );
    } finally {
      await server.stop();
    }
  });
});
