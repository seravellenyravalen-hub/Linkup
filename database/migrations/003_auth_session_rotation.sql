ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS replaced_by_session_id uuid
    REFERENCES sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS sessions_replaced_by_session_idx
  ON sessions (replaced_by_session_id);
