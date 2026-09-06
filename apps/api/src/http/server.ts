import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { Router } from './router';
import {
  errorResponse,
  HttpRequestError,
} from './http.errors';

const MAX_BODY_BYTES = 64 * 1024;

type AuthController = {
  register(request: Request): Response | Promise<Response>;
  verifyEmail(request: Request): Response | Promise<Response>;
  login(request: Request): Response | Promise<Response>;
  refresh(request: Request): Response | Promise<Response>;
  logout(request: Request): Response | Promise<Response>;
};

type HttpServerOptions = {
  authController?: AuthController;
};

async function readRequestBody(
  request: IncomingMessage,
): Promise<Uint8Array | undefined> {
  const contentLength = request.headers['content-length'];

  if (contentLength) {
    const length = Number(contentLength);

    if (!Number.isFinite(length) || length < 0) {
      throw new HttpRequestError('Invalid Content-Length');
    }

    if (length > MAX_BODY_BYTES) {
      throw new HttpRequestError('Request body too large');
    }
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk)
      ? chunk
      : Buffer.from(chunk);

    totalBytes += buffer.length;

    if (totalBytes > MAX_BODY_BYTES) {
      throw new HttpRequestError('Request body too large');
    }

    chunks.push(buffer);
  }

  if (totalBytes === 0) {
    return undefined;
  }

  return Buffer.concat(chunks);
}

export function createHttpServer(
  options: HttpServerOptions = {},
) {
  const router = new Router();

  if (options.authController) {
    router.register(
      'POST',
      '/api/v1/auth/register',
      options.authController.register,
    );
    router.register(
      'POST',
      '/api/v1/auth/verify-email',
      options.authController.verifyEmail,
    );
    router.register(
      'POST',
      '/api/v1/auth/login',
      options.authController.login,
    );
    router.register(
      'POST',
      '/api/v1/auth/refresh',
      options.authController.refresh,
    );
    router.register(
      'POST',
      '/api/v1/auth/logout',
      options.authController.logout,
    );
  }

  const server = createServer(
    async (
      req: IncomingMessage,
      res: ServerResponse,
    ) => {
      try {
        const host = req.headers.host ?? '127.0.0.1';
        const url = new URL(
          req.url ?? '/',
          `http://${host}`,
        );

        const status = router.status(
          req.method ?? 'GET',
          url.pathname,
        );

        if (status === 404) {
          res.statusCode = 404;
          res.end();
          return;
        }

        if (status === 405) {
          res.statusCode = 405;
          res.end();
          return;
        }

        const handler = router.match(
          req.method ?? 'GET',
          url.pathname,
        );

        if (!handler) {
          res.statusCode = 404;
          res.end();
          return;
        }

        const body = await readRequestBody(req);
        const contentType = req.headers['content-type'] ?? '';

        if (
          body &&
          !contentType
            .toLowerCase()
            .startsWith('application/json')
        ) {
          throw new HttpRequestError(
            'JSON request body required',
          );
        }

        const request = new Request(url, {
          method: req.method ?? 'GET',
          headers: req.headers as Record<string, string>,
          body,
        });

        const response = await handler(request);

        res.statusCode = response.status;

        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });

        const responseBody = await response.arrayBuffer();
        res.end(Buffer.from(responseBody));
      } catch (error) {
        const response = errorResponse(error);

        res.statusCode = response.status;

        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });

        const body = await response.arrayBuffer();
        res.end(Buffer.from(body));
      }
    },
  );

  return {
    router,

    start(
      port = 3000,
      host = '127.0.0.1',
    ) {
      return new Promise<{ port: number }>(
        (resolve, reject) => {
          const onError = (error: Error) => {
            server.off('listening', onListening);
            reject(error);
          };

          const onListening = () => {
            server.off('error', onError);

            const address = server.address();

            if (
              !address ||
              typeof address === 'string'
            ) {
              reject(
                new Error(
                  'Unable to determine server address',
                ),
              );
              return;
            }

            resolve({ port: address.port });
          };

          server.once('error', onError);
          server.once('listening', onListening);
          server.listen(port, host);
        },
      );
    },

    stop() {
      return new Promise<void>((resolve, reject) => {
        if (!server.listening) {
          resolve();
          return;
        }

        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
  };
}
