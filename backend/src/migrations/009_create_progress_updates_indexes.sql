-- Migration: Create indexes for progress_updates table

-- Index on key_result_id for fetching progress history
CREATE INDEX progress_updates_key_result_id_idx ON progress_updates(key_result_id);

-- Index on recorded_at for timeline queries and trend analysis
CREATE INDEX progress_updates_recorded_at_idx ON progress_updates(recorded_at DESC);

-- Composite index for progress history queries (key result + chronological order)
CREATE INDEX progress_updates_history_idx ON progress_updates(key_result_id, recorded_at DESC);

COMMENT ON INDEX progress_updates_key_result_id_idx IS 'Optimizes fetching progress history for key results';
COMMENT ON INDEX progress_updates_recorded_at_idx IS 'Optimizes chronological queries and trend analysis';
COMMENT ON INDEX progress_updates_history_idx IS 'Optimizes progress history timeline queries';
