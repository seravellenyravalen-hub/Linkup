import type { AuthService } from './auth.service';

export class AuthController {
  constructor(
    private readonly authService: Pick<
      AuthService,
      'register' | 'verifyEmail' | 'login' | 'refresh' | 'logout'
    >,
  ) {}

  async register(request: Request): Promise<Response> {
    const body = await request.json() as {
      email?: unknown;
      password?: unknown;
    };

    if (
      typeof body.email !== 'string' ||
      typeof body.password !== 'string'
    ) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid registration request',
          },
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
          },
        },
      );
    }

    const user = await this.authService.register(
      body.email,
      body.password,
    );

    return new Response(
      JSON.stringify({
        user,
      }),
      {
        status: 201,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }

  async verifyEmail(request: Request): Promise<Response> {
    const body = await request.json() as {
      token?: unknown;
    };

    if (typeof body.token !== 'string' || !body.token) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid email verification request',
          },
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
          },
        },
      );
    }

    const verified = await this.authService.verifyEmail(
      body.token,
    );

    return new Response(
      JSON.stringify({ verified }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }

  async login(request: Request): Promise<Response> {
    const body = await request.json() as {
      email?: unknown;
      password?: unknown;
      deviceId?: unknown;
    };

    if (
      typeof body.email !== 'string' ||
      typeof body.password !== 'string' ||
      (
        body.deviceId !== undefined &&
        typeof body.deviceId !== 'string'
      )
    ) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid login request',
          },
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
          },
        },
      );
    }

    const tokens = await this.authService.login(
      body.email,
      body.password,
      body.deviceId,
    );

    return new Response(
      JSON.stringify(tokens),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }

  async refresh(request: Request): Promise<Response> {
    const body = await request.json() as {
      refreshToken?: unknown;
    };

    if (
      typeof body.refreshToken !== 'string' ||
      !body.refreshToken
    ) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid refresh request',
          },
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
          },
        },
      );
    }

    const tokens = await this.authService.refresh(
      body.refreshToken,
    );

    return new Response(
      JSON.stringify(tokens),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }

  async logout(request: Request): Promise<Response> {
    const body = await request.json() as {
      refreshToken?: unknown;
    };

    if (
      typeof body.refreshToken !== 'string' ||
      !body.refreshToken
    ) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid logout request',
          },
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
          },
        },
      );
    }

    await this.authService.logout(body.refreshToken);

    return new Response(null, {
      status: 204,
    });
  }
}
