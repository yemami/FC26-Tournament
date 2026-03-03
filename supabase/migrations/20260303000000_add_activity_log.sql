-- Activity log for match edits and comments
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id TEXT NOT NULL,
  match_id TEXT,
  actor_id TEXT,
  actor_label TEXT,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_tournament_id ON activity_log(tournament_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_match_id ON activity_log(match_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on activity_log" ON activity_log FOR ALL USING (true) WITH CHECK (true);
