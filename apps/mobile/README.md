# LinkUp mobile

Premium LinkUp mobile client built with Expo Router.

## Development

Install dependencies and start Expo:

```bash
npm install
npx expo start
```

The app uses `src/app` for file-based routing.

## API configuration

Authentication is connected to the LinkUp API through `EXPO_PUBLIC_API_URL`.

Copy `.env.example` to `.env` and set the API URL:

```text
EXPO_PUBLIC_API_URL=https://your-api.example.com
```

For Expo Go on a physical Android device, the API address must be reachable from that phone. `127.0.0.1` refers to the phone itself, not the development machine or Termux host.

Do not put private API keys or server secrets in `EXPO_PUBLIC_*` variables. Values with that prefix are exposed to the client bundle.

## Authentication

The mobile client currently supports:

- Sign in through `/api/v1/auth/login`
- Refresh-token rotation through `/api/v1/auth/refresh`
- Secure refresh-token storage with Expo SecureStore
- Session restoration on app launch
- Logout through `/api/v1/auth/logout`

The API must be deployed and reachable before real sign-in can succeed from a device.

## Testing

The mobile package includes a Vitest test script:

```bash
npm test
```

When dependencies are installed, this covers the client-side authentication/storage contracts.
