-- Migration: Create key_results table
-- Per data-model.md KeyResult entity schema

CREATE TABLE key_results (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to objective
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,

  -- Key result fields
  description VARCHAR(300) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  deadline DATE NOT NULL,

  -- Computed field (calculated on read)
  -- completion_percentage = (current_value / target_value) * 100, capped at 100

  status key_result_status NOT NULL DEFAULT 'not_started',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE key_results IS 'Measurable outcomes indicating objective achievement';
COMMENT ON COLUMN key_results.description IS 'Measurable key result (10-300 characters)';
COMMENT ON COLUMN key_results.target_value IS 'Target value to achieve (must be > 0)';
COMMENT ON COLUMN key_results.current_value IS 'Current progress value';
COMMENT ON COLUMN key_results.unit IS 'Unit of measurement (e.g., certifications, projects)';
COMMENT ON COLUMN key_results.deadline IS 'Key result deadline (typically quarterly)';

-- Constraints
ALTER TABLE key_results
  ADD CONSTRAINT key_results_description_length CHECK (LENGTH(description) >= 10 AND LENGTH(description) <= 300),
  ADD CONSTRAINT key_results_target_value_positive CHECK (target_value > 0),
  ADD CONSTRAINT key_results_current_value_valid CHECK (current_value >= 0 AND current_value <= target_value);

-- Trigger for updated_at
CREATE TRIGGER key_results_updated_at
  BEFORE UPDATE ON key_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate completion percentage
CREATE OR REPLACE FUNCTION calculate_completion_percentage(current_val DECIMAL, target_val DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF target_val = 0 THEN
    RETURN 0;
  END IF;
  RETURN LEAST((current_val / target_val) * 100, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to auto-update key result status based on progress
CREATE OR REPLACE FUNCTION update_key_result_status()
RETURNS TRIGGER AS $$
DECLARE
  completion_pct DECIMAL;
  days_until_deadline INTEGER;
BEGIN
  -- Calculate completion percentage
  completion_pct := calculate_completion_percentage(NEW.current_value, NEW.target_value);

  -- Calculate days until deadline
  days_until_deadline := NEW.deadline - CURRENT_DATE;

  -- Update status based on completion and deadline
  IF completion_pct >= 100 THEN
    NEW.status := 'completed';
  ELSIF NEW.current_value > 0 THEN
    -- Check if at risk (deadline < 14 days and completion < 50%)
    IF days_until_deadline < 14 AND completion_pct < 50 THEN
      NEW.status := 'at_risk';
    ELSE
      NEW.status := 'in_progress';
    END IF;
  ELSE
    NEW.status := 'not_started';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update status
CREATE TRIGGER key_results_auto_status
  BEFORE INSERT OR UPDATE OF current_value, target_value, deadline ON key_results
  FOR EACH ROW
  EXECUTE FUNCTION update_key_result_status();
