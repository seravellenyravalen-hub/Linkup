ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS token_family_id uuid;

UPDATE sessions
SET token_family_id = gen_random_uuid()
WHERE token_family_id IS NULL;

ALTER TABLE sessions
  ALTER COLUMN token_family_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS sessions_token_family_id_idx
  ON sessions (token_family_id);

CREATE INDEX IF NOT EXISTS sessions_expires_at_idx
  ON sessions (expires_at);

CREATE INDEX IF NOT EXISTS sessions_active_user_idx
  ON sessions (user_id, expires_at)
  WHERE revoked_at IS NULL;
