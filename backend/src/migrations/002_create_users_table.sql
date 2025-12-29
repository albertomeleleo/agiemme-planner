-- Migration: Create users table
-- Per data-model.md User entity schema
-- Foundation for all user-owned entities (objectives, learning paths, calendar events)

CREATE TABLE users (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication fields
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  -- Profile fields
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',

  -- Notification preferences (JSONB for flexibility)
  notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "reminderHours": 24}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for personal growth planning';
COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID)';
COMMENT ON COLUMN users.email IS 'User email for authentication and notifications (RFC 5322 format)';
COMMENT ON COLUMN users.password_hash IS 'Hashed password using bcrypt';
COMMENT ON COLUMN users.timezone IS 'IANA timezone identifier (e.g., America/New_York)';
COMMENT ON COLUMN users.notification_preferences IS 'User notification settings (email enabled, reminder hours before events)';

-- Constraints
ALTER TABLE users
  ADD CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT users_timezone_not_empty CHECK (LENGTH(timezone) > 0);

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
