# LinkUp HTTP API Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-light native Node HTTP API layer for LinkUp that exposes the existing authentication services through a secure, testable `/api/v1` API.

**Architecture:** Node's built-in `http` server receives bounded JSON requests, a small router dispatches exact method/path matches, and authentication controllers translate HTTP requests into the existing `AuthService`. Controllers never access PostgreSQL directly; repositories and services remain responsible for authentication behavior.

**Tech Stack:** TypeScript, Node.js built-in `http`, Vitest, existing PostgreSQL/auth/session services.

**Spec:** `docs/superpowers/specs/2026-09-05-linkup-http-api-foundation.md`

## Global Constraints

- JSON API under `/api/v1`
- Use Node's built-in HTTP server; do not add a runtime routing framework
- Auth business logic stays in `AuthService`
- Controllers never access PostgreSQL directly
- No passwords or raw verification/refresh tokens in logs
- Request bodies are bounded to 64 KiB by default
- Malformed JSON returns HTTP 400
- Unknown routes return HTTP 404
- Unsupported methods on known routes return HTTP 405
- Unexpected failures return a generic HTTP 500 response
- Existing 45 authentication/database tests must remain green
- Every production behavior follows RED -> GREEN -> regression testing
- Do not expose email-verification tokens from the production registration endpoint
- Refresh-token rotation remains delegated to `SessionService`
- Email verification remains delegated to `EmailVerificationService`

## File Map

### Create
- `apps/api/src/http/router.ts` — exact method/path routing.
- `apps/api/src/http/router.test.ts` — router tests.
- `apps/api/src/http/http.errors.ts` — HTTP error representation and auth-error mapping.
- `apps/api/src/http/http.errors.test.ts` — error mapping tests.
- `apps/api/src/http/server.ts` — native Node HTTP server, request parsing, body limits, response serialization.
- `apps/api/src/http/server.test.ts` — transport tests.
- `apps/api/src/modules/auth/auth.controller.ts` — HTTP-to-AuthService translation.
- `apps/api/src/modules/auth/auth.controller.test.ts` — controller contract tests.
- `apps/api/src/server.ts` — production dependency composition and startup.
- `docs/superpowers/specs/2026-09-05-linkup-http-api-foundation.md` — architectural specification.

### Modify
- `apps/api/package.json` — add startup scripts only if required by the existing runtime setup.

## Task 1: Router Contract

**Files:** `apps/api/src/http/router.test.ts`, `apps/api/src/http/router.ts`

- [ ] Write failing tests for exact method/path matching, unknown paths, and known paths with unsupported methods.
- [ ] Run `npx vitest run apps/api/src/http/router.test.ts` and confirm RED.
- [ ] Implement the minimal in-memory method/path router with no dynamic parameters.
- [ ] Run the router tests and confirm GREEN.
- [ ] Run `npm test -- --run` and confirm the existing suite remains green.
- [ ] Commit with `git add apps/api/src/http/router.ts apps/api/src/http/router.test.ts && git commit -m "feat: add http router foundation"`.

## Task 2: HTTP Error Contract

**Files:** `apps/api/src/http/http.errors.test.ts`, `apps/api/src/http/http.errors.ts`

- [ ] Write failing tests for `INVALID_REQUEST -> 400`, `CONFLICT -> 409`, `UNAUTHENTICATED -> 401`, `FORBIDDEN -> 403`, and unknown errors -> generic 500.
- [ ] Confirm RED.
- [ ] Implement `authErrorToHttp(error)` and the stable `{ error: { code, message } }` response shape.
- [ ] Confirm GREEN.
- [ ] Run the full suite.
- [ ] Commit with `git add apps/api/src/http/http.errors.ts apps/api/src/http/http.errors.test.ts && git commit -m "feat: add http auth error mapping"`.

## Task 3: Native HTTP Server

**Files:** `apps/api/src/http/server.test.ts`, `apps/api/src/http/server.ts`

- [ ] Write failing tests for JSON dispatch, malformed JSON -> 400, oversized body -> 413, unknown route -> 404, JSON response content type, and unexpected handler failure -> generic 500.
- [ ] Confirm RED.
- [ ] Implement the native Node HTTP server with a 64 KiB default body limit and `Router` injection.
- [ ] Confirm GREEN.
- [ ] Run `npm test -- --run` and confirm all existing tests remain green.
- [ ] Commit with `git add apps/api/src/http/server.ts apps/api/src/http/server.test.ts && git commit -m "feat: add native http server"`.

## Task 4: Authentication Controller — Registration

**Files:** `apps/api/src/modules/auth/auth.controller.test.ts`, `apps/api/src/modules/auth/auth.controller.ts`

- [ ] Write failing registration tests using a mocked `AuthService`.
- [ ] Confirm RED.
- [ ] Implement `createAuthController({ authService })` and `register(request)`.
- [ ] Return `201` with `{ user: { id, email } }` only; never expose the verification token.
- [ ] Confirm GREEN and error mapping.
- [ ] Commit with `git add apps/api/src/modules/auth/auth.controller.ts apps/api/src/modules/auth/auth.controller.test.ts && git commit -m "feat: add auth registration controller"`.

## Task 5: Wire Registration Route

**Files:** `apps/api/src/server.ts`, HTTP tests as needed.

- [ ] Write a failing HTTP integration test for `POST /api/v1/auth/register`.
- [ ] Confirm RED.
- [ ] Wire `Router -> AuthController.register`.
- [ ] Confirm GREEN.
- [ ] Run the full suite.
- [ ] Commit with `git add apps/api/src/server.ts apps/api/src/http && git commit -m "feat: expose auth registration endpoint"`.

## Task 6: Email Verification

**Files:** auth controller/test and server composition.

- [ ] Write failing tests for `{ token }` -> `AuthService.verifyEmail(token)` and `{ verified: true }` -> 200.
- [ ] Confirm RED.
- [ ] Implement and wire `POST /api/v1/auth/verify-email`.
- [ ] Confirm GREEN and run the full suite.
- [ ] Commit with `git add apps/api/src/modules/auth apps/api/src/server.ts && git commit -m "feat: expose email verification endpoint"`.

## Task 7: Login

**Files:** auth controller/test and server composition.

- [ ] Write failing tests for `{ email, password, deviceId? }` -> `AuthService.login`.
- [ ] Confirm RED.
- [ ] Implement and wire `POST /api/v1/auth/login`.
- [ ] Return the access/refresh token pair from the service without logging or altering tokens.
- [ ] Confirm GREEN and run the full suite.
- [ ] Commit with `git add apps/api/src/modules/auth apps/api/src/server.ts && git commit -m "feat: expose auth login endpoint"`.

## Task 8: Refresh

**Files:** auth controller/test and server composition.

- [ ] Write failing tests for `{ refreshToken }` -> `AuthService.refresh(refreshToken)`.
- [ ] Confirm RED.
- [ ] Implement and wire `POST /api/v1/auth/refresh`.
- [ ] Confirm GREEN and run the full suite.
- [ ] Commit with `git add apps/api/src/modules/auth apps/api/src/server.ts && git commit -m "feat: expose auth refresh endpoint"`.

## Task 9: Logout

**Files:** auth controller/test and server composition.

- [ ] Write failing tests for `{ refreshToken }` -> `AuthService.logout(refreshToken)` and `204 No Content`.
- [ ] Confirm RED.
- [ ] Implement and wire `POST /api/v1/auth/logout`.
- [ ] Confirm GREEN and run the full suite.
- [ ] Commit with `git add apps/api/src/modules/auth apps/api/src/server.ts && git commit -m "feat: expose auth logout endpoint"`.

## Task 10: Production Composition

**Files:** `apps/api/src/server.ts`, `apps/api/package.json`.

- [ ] Write a failing composition/startup test where practical.
- [ ] Confirm RED.
- [ ] Compose database pool, repositories, services, `AuthService`, controller, router, and HTTP server without putting business logic in startup.
- [ ] Add only the minimum startup script/configuration required.
- [ ] Confirm GREEN and run the full suite.
- [ ] Commit with `git add apps/api/src/server.ts apps/api/package.json && git commit -m "feat: compose linkup api server"`.

## Task 11: Security Regression Tests

**Files:** HTTP and auth controller tests.

- [ ] Add tests for missing bodies, wrong JSON types, malformed JSON, oversized requests, unknown endpoints, unsupported methods, generic unexpected errors, and absence of passwords/raw tokens from responses.
- [ ] Confirm failures before each new behavior.
- [ ] Implement only the required transport behavior.
- [ ] Run targeted tests, then `npm test -- --run`.
- [ ] Commit with `git add apps/api/src/http apps/api/src/modules/auth && git commit -m "test: harden http auth boundaries"`.

## Task 12: Final Verification

- [ ] Run `cd ~/Linkup && npm test -- --run`.
- [ ] Run the repository's TypeScript validation command.
- [ ] Run `git status` and `git log --oneline -12`.
- [ ] Confirm no credentials or raw tokens were committed.
- [ ] Do not push to a shared branch until the final verification is reviewed.
