-- Add actor info to reset history
ALTER TABLE reset_history
  ADD COLUMN IF NOT EXISTS actor_id TEXT,
  ADD COLUMN IF NOT EXISTS actor_label TEXT;

CREATE INDEX IF NOT EXISTS idx_reset_history_actor_id ON reset_history(actor_id);
