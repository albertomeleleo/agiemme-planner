-- Migration: Create indexes for users table
-- Per data-model.md indexes strategy
-- Optimizes authentication and user lookups (<200ms reads per constitution)

-- Primary key index (automatically created, listed for documentation)
-- CREATE UNIQUE INDEX users_pkey ON users(id);

-- Unique index on email for login queries
-- Already created by UNIQUE constraint, but explicitly documented
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users(email);

-- Index on created_at for user registration analytics
CREATE INDEX users_created_at_idx ON users(created_at DESC);

-- Partial index for timezone queries (only non-UTC timezones)
CREATE INDEX users_timezone_idx ON users(timezone) WHERE timezone != 'UTC';

COMMENT ON INDEX users_email_unique_idx IS 'Optimizes login queries by email (unique constraint index)';
COMMENT ON INDEX users_created_at_idx IS 'Optimizes user registration analytics and sorting';
COMMENT ON INDEX users_timezone_idx IS 'Optimizes timezone-based queries for notification scheduling';
