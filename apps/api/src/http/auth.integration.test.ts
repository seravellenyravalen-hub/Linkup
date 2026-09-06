import { describe, expect, it } from 'vitest';
import { createHttpServer } from './server';

describe('HTTP auth integration', () => {
  const createServer = () =>
    createHttpServer({
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
        verifyEmail: async () =>
          new Response(JSON.stringify({ verified: true }), {
            status: 200,
            headers: {
              'content-type': 'application/json',
            },
          }),
        login: async () =>
          new Response(
            JSON.stringify({
              accessToken: 'access-token',
              refreshToken: 'refresh-token',
            }),
            {
              status: 200,
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        refresh: async () =>
          new Response(
            JSON.stringify({
              accessToken: 'rotated-access-token',
              refreshToken: 'rotated-refresh-token',
            }),
            {
              status: 200,
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        logout: async () => new Response(null, { status: 204 }),
      },
    });

  it('registers a user through POST /api/v1/auth/register', async () => {
    const server = createServer();
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
      expect(body.user.email).toBe('integration@example.com');
    } finally {
      await server.stop();
    }
  });

  it('verifies an email through POST /api/v1/auth/verify-email', async () => {
    const server = createServer();
    const { port } = await server.start(0);

    try {
      const response = await fetch(
        `http://127.0.0.1:${port}/api/v1/auth/verify-email`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ token: 'verification-token' }),
        },
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ verified: true });
    } finally {
      await server.stop();
    }
  });

  it('logs in through POST /api/v1/auth/login', async () => {
    const server = createServer();
    const { port } = await server.start(0);

    try {
      const response = await fetch(
        `http://127.0.0.1:${port}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            email: 'integration@example.com',
            password: 'a-strong-password-123',
            deviceId: 'device-1',
          }),
        },
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    } finally {
      await server.stop();
    }
  });

  it('refreshes a session through POST /api/v1/auth/refresh', async () => {
    const server = createServer();
    const { port } = await server.start(0);

    try {
      const response = await fetch(
        `http://127.0.0.1:${port}/api/v1/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: 'refresh-token' }),
        },
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        accessToken: 'rotated-access-token',
        refreshToken: 'rotated-refresh-token',
      });
    } finally {
      await server.stop();
    }
  });

  it('logs out through POST /api/v1/auth/logout', async () => {
    const server = createServer();
    const { port } = await server.start(0);

    try {
      const response = await fetch(
        `http://127.0.0.1:${port}/api/v1/auth/logout`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: 'refresh-token' }),
        },
      );

      expect(response.status).toBe(204);
      expect(await response.text()).toBe('');
    } finally {
      await server.stop();
    }
  });
});
