SET search_path TO main, public;

CREATE TABLE IF NOT EXISTS main.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR DEFAULT 'Push',
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  deleted BOOLEAN DEFAULT false,
  deleted_on TIMESTAMPTZ,
  deleted_by VARCHAR,
  created_on TIMESTAMPTZ DEFAULT NOW(),
  modified_on TIMESTAMPTZ
);