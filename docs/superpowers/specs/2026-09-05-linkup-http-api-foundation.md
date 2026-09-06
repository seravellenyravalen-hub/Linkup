# LinkUp HTTP API Foundation

## Goal
Expose the existing LinkUp authentication services through a small, secure, testable `/api/v1` HTTP API without moving business logic into the transport layer.

## Architecture
Node's built-in `http` server receives bounded JSON requests. A small exact method/path router dispatches requests to authentication controllers. Controllers translate HTTP input/output and delegate all authentication behavior to `AuthService`, `SessionService`, and `EmailVerificationService`.

## Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

## Request Contracts
Registration: `{ email, password }`

Verification: `{ token }`

Login: `{ email, password, deviceId? }`

Refresh: `{ refreshToken }`

Logout: `{ refreshToken }`

## Responses
Registration returns `201` with `{ user: { id, email } }` and never returns the verification token.

Verification returns `200` with `{ verified: true }`.

Login and refresh return `200` with `{ accessToken, refreshToken }`.

Logout returns `204` with no body.

## Error Contract
Expected errors are JSON:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid registration details"
  }
}
```

Mapping:
- `INVALID_REQUEST` -> 400
- `CONFLICT` -> 409
- `UNAUTHENTICATED` -> 401
- `FORBIDDEN` -> 403
- unknown/unexpected errors -> 500
- unknown route -> 404
- unsupported method for known route -> 405
- oversized request body -> 413

Unexpected errors expose no stack traces, SQL, credentials, passwords, or raw tokens.

## Security Boundaries
- JSON request handling only.
- Maximum request body size: 64 KiB by default.
- Controllers never access PostgreSQL directly.
- Authentication logic remains in existing services.
- Raw passwords, verification tokens, and refresh tokens are never logged or returned accidentally.
- Login failures retain generic authentication messaging.
- CORS, security headers, and rate limiting are separate hardening work after the HTTP foundation.

## Testing
Every production behavior follows RED -> GREEN -> regression testing. Existing authentication/database tests must remain green. HTTP tests use injected/mock service dependencies and do not require a live database.

## Production Composition
`databasePool` -> repositories/services -> `AuthService` -> `AuthController` -> `Router` -> native Node HTTP server.

Startup configuration is separate from business logic.
