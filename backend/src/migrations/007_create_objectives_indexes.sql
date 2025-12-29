-- Migration: Create indexes for objectives table
-- Per data-model.md indexes strategy for query optimization

-- Index on user_id for fetching user's objectives (<200ms per constitution)
CREATE INDEX objectives_user_id_idx ON objectives(user_id);

-- Index on category for filtering by life area
CREATE INDEX objectives_category_idx ON objectives(category);

-- Index on status for filtering active vs archived
CREATE INDEX objectives_status_idx ON objectives(status);

-- Index on target_date for deadline proximity sorting
CREATE INDEX objectives_target_date_idx ON objectives(target_date);

-- Composite index for common query: user's active objectives by category
CREATE INDEX objectives_user_active_category_idx ON objectives(user_id, status, category)
  WHERE status = 'active';

-- Index on created_at for sorting by creation date
CREATE INDEX objectives_created_at_idx ON objectives(created_at DESC);

COMMENT ON INDEX objectives_user_id_idx IS 'Optimizes fetching user objectives';
COMMENT ON INDEX objectives_category_idx IS 'Optimizes filtering by life area';
COMMENT ON INDEX objectives_status_idx IS 'Optimizes active/archived filtering';
COMMENT ON INDEX objectives_target_date_idx IS 'Optimizes deadline proximity queries';
COMMENT ON INDEX objectives_user_active_category_idx IS 'Optimizes dashboard queries for active objectives';
