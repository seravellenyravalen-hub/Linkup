CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS email_verification_tokens_hash_unique_idx
  ON email_verification_tokens(token_hash);

CREATE INDEX IF NOT EXISTS email_verification_tokens_user_active_idx
  ON email_verification_tokens(user_id, expires_at)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS email_verification_tokens_expires_at_idx
  ON email_verification_tokens(expires_at);
