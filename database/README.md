# LinkUp database migrations

PostgreSQL is the authoritative persistent store for LinkUp. Migration files are ordered by numeric version (`001_`, `002_`, ...).

## Rules

- Every migration must be safe to run exactly once and recorded in `schema_migrations`.
- Never edit an already-applied migration. Add a new migration instead.
- Prefer additive, backward-compatible changes before destructive changes.
- Production data must be preserved across application releases.
- Destructive changes require a staged expand/contract migration and explicit review.
- Never commit `DATABASE_URL` or any database credential.

Run the API migration command only against the intended environment after confirming `DATABASE_URL`.
