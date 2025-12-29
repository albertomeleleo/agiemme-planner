-- Migration: Create progress_updates table
-- Per data-model.md ProgressUpdate entity schema

CREATE TABLE progress_updates (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to key result
  key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,

  -- Progress update fields
  value_recorded DECIMAL(10,2) NOT NULL,
  notes TEXT,

  -- Timestamp
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE progress_updates IS 'Point-in-time records of key result advancement';
COMMENT ON COLUMN progress_updates.value_recorded IS 'Progress value at this point in time';
COMMENT ON COLUMN progress_updates.notes IS 'Optional user notes about progress (max 1000 characters)';

-- Constraints
ALTER TABLE progress_updates
  ADD CONSTRAINT progress_updates_value_positive CHECK (value_recorded >= 0),
  ADD CONSTRAINT progress_updates_notes_length CHECK (notes IS NULL OR LENGTH(notes) <= 1000);

-- Function to update key result current_value when progress is recorded
CREATE OR REPLACE FUNCTION update_key_result_from_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the key result's current_value to the new progress value
  UPDATE key_results
  SET current_value = NEW.value_recorded,
      updated_at = NOW()
  WHERE id = NEW.key_result_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update key result when progress recorded
CREATE TRIGGER progress_updates_update_key_result
  AFTER INSERT ON progress_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_key_result_from_progress();
