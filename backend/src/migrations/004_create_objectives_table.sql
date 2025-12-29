-- Migration: Create objectives table
-- Per data-model.md Objective entity schema

CREATE TABLE objectives (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to user
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Objective fields
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category objective_category NOT NULL,
  target_date DATE NOT NULL,
  status objective_status NOT NULL DEFAULT 'active',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE objectives IS 'High-level personal growth goals using OKR framework';
COMMENT ON COLUMN objectives.title IS 'Objective title (5-200 characters)';
COMMENT ON COLUMN objectives.category IS 'Life area: career, health, relationships, skills, financial, personal';
COMMENT ON COLUMN objectives.target_date IS 'Target completion date for objective';
COMMENT ON COLUMN objectives.status IS 'active, completed, archived, abandoned';

-- Constraints
ALTER TABLE objectives
  ADD CONSTRAINT objectives_title_length CHECK (LENGTH(title) >= 5 AND LENGTH(title) <= 200),
  ADD CONSTRAINT objectives_target_date_future CHECK (target_date >= CURRENT_DATE);

-- Trigger for updated_at
CREATE TRIGGER objectives_updated_at
  BEFORE UPDATE ON objectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
