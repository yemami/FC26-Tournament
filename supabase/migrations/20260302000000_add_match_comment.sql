-- Add comment column to matches table (local + future migrations)
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS comment TEXT;
