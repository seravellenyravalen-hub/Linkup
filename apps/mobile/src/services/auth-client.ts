export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthClient = {
  register(email: string, password: string): Promise<AuthUser>;
  login(email: string, password: string, deviceId?: string): Promise<AuthTokens>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  logout(refreshToken: string): Promise<void>;
};

type ErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request<T>(
  fetcher: typeof fetch,
  url: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetcher(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const body = await readJson(response);
  if (!response.ok) {
    const payload = body as ErrorPayload | null;
    throw new Error(payload?.error?.message ?? `Request failed (${response.status})`);
  }

  return body as T;
}

export function createAuthClient(
  baseUrl: string,
  fetcher: typeof fetch = fetch,
): AuthClient {
  const root = baseUrl.replace(/\/$/, '');

  return {
    register(email, password) {
      return request<AuthUser>(fetcher, `${root}/api/v1/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    login(email, password, deviceId) {
      return request<AuthTokens>(fetcher, `${root}/api/v1/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password, deviceId }),
      });
    },

    refresh(refreshToken) {
      return request<AuthTokens>(fetcher, `${root}/api/v1/auth/refresh`, {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    },

    async logout(refreshToken) {
      await request<unknown>(fetcher, `${root}/api/v1/auth/logout`, {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    },
  };
}
