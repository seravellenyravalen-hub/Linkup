CREATE TABLE IF NOT EXISTS contact_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  name text NULL,
  email text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_reports_status_created_idx ON contact_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS contact_reports_email_idx ON contact_reports(email);
