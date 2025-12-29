-- Migration: Create ENUM types
-- Per data-model.md schema definitions
-- These ENUMs are used across all entity tables

-- Objective category enumeration (Constitution Section: Functional Requirements FR-001)
CREATE TYPE objective_category AS ENUM (
  'career',
  'health',
  'relationships',
  'skills',
  'financial',
  'personal'
);

-- Objective status enumeration
CREATE TYPE objective_status AS ENUM (
  'active',
  'completed',
  'archived',
  'abandoned'
);

-- Key result status enumeration
CREATE TYPE key_result_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'at_risk'
);

-- Learning path status enumeration
CREATE TYPE learning_path_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

-- Learning resource type enumeration (FR-008)
CREATE TYPE learning_resource_type AS ENUM (
  'book',
  'course',
  'article',
  'video',
  'practice_project',
  'other'
);

-- Learning resource status enumeration
CREATE TYPE learning_resource_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

-- Calendar event status enumeration (FR-018)
CREATE TYPE calendar_event_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);

COMMENT ON TYPE objective_category IS 'Life areas for personal growth objectives';
COMMENT ON TYPE objective_status IS 'Lifecycle status of an objective';
COMMENT ON TYPE key_result_status IS 'Progress status of a key result';
COMMENT ON TYPE learning_path_status IS 'Completion status of a learning path';
COMMENT ON TYPE learning_resource_type IS 'Type of learning material';
COMMENT ON TYPE learning_resource_status IS 'Completion status of a learning resource';
COMMENT ON TYPE calendar_event_status IS 'Status of a scheduled event';
