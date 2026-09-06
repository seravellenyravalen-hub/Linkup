export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthClient = {
  login(email: string, password: string, deviceId?: string): Promise<AuthTokens>;
};

export function createAuthClient(baseUrl: string, fetcher: typeof fetch = fetch): AuthClient {
  return {
    async login(email, password, deviceId) {
      const response = await fetcher(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, deviceId }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error?.message ?? 'Unable to sign in');
      }

      return body as AuthTokens;
    },
  };
}
