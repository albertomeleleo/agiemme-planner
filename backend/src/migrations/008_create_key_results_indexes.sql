-- Migration: Create indexes for key_results table

-- Index on objective_id for fetching objective's key results
CREATE INDEX key_results_objective_id_idx ON key_results(objective_id);

-- Index on deadline for identifying at-risk key results
CREATE INDEX key_results_deadline_idx ON key_results(deadline);

-- Index on status for filtering by status
CREATE INDEX key_results_status_idx ON key_results(status);

-- Composite index for at-risk detection queries
CREATE INDEX key_results_at_risk_idx ON key_results(status, deadline)
  WHERE status = 'at_risk';

-- Index on created_at
CREATE INDEX key_results_created_at_idx ON key_results(created_at DESC);

COMMENT ON INDEX key_results_objective_id_idx IS 'Optimizes fetching key results for objectives';
COMMENT ON INDEX key_results_deadline_idx IS 'Optimizes deadline-based queries';
COMMENT ON INDEX key_results_status_idx IS 'Optimizes status filtering';
COMMENT ON INDEX key_results_at_risk_idx IS 'Optimizes at-risk key result identification';
