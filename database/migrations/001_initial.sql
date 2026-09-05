BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_verified_at timestamptz,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (lower(email)) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL,
  display_name text NOT NULL,
  bio text,
  avatar_media_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx ON profiles (lower(username));
CREATE INDEX IF NOT EXISTS profiles_display_name_idx ON profiles USING gin (to_tsvector('simple', display_name));

CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('android','ios')),
  device_name text,
  push_token text,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS devices_user_idx ON devices(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS devices_push_token_unique_idx ON devices(push_token) WHERE push_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id uuid REFERENCES devices(id) ON DELETE SET NULL,
  refresh_token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS sessions_refresh_hash_unique_idx ON sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS sessions_user_active_idx ON sessions(user_id, revoked_at, expires_at);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'direct' CHECK (kind IN ('direct')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  pinned_at timestamptz,
  muted_until timestamptz,
  archived_at timestamptz,
  unread_marked_at timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS conversation_members_user_idx ON conversation_members(user_id, conversation_id);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  client_message_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('text','image','video','voice','file')),
  text_content text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  reply_to_message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_for_everyone_at timestamptz,
  CHECK (type <> 'text' OR text_content IS NOT NULL OR deleted_at IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS messages_sender_client_id_unique_idx ON messages(sender_id, client_message_id);
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx ON messages(conversation_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS messages_sender_created_idx ON messages(sender_id, created_at DESC);

CREATE TABLE IF NOT EXISTS message_status (
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delivered_at timestamptz,
  read_at timestamptz,
  PRIMARY KEY (message_id, user_id)
);
CREATE INDEX IF NOT EXISTS message_status_user_read_idx ON message_status(user_id, read_at);

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
CREATE INDEX IF NOT EXISTS blocks_blocked_idx ON blocks(blocked_id);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reported_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS reports_status_created_idx ON reports(status, created_at DESC);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  online_status_visible boolean NOT NULL DEFAULT true,
  last_seen_visible boolean NOT NULL DEFAULT true,
  typing_visible boolean NOT NULL DEFAULT true,
  read_receipts_enabled boolean NOT NULL DEFAULT true,
  app_lock_enabled boolean NOT NULL DEFAULT false,
  notification_sounds_enabled boolean NOT NULL DEFAULT true,
  notification_vibration_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS security_events_user_created_idx ON security_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS security_events_type_created_idx ON security_events(event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
