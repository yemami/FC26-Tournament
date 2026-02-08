-- Migration script to update reset_history table from coordinates to city_name
-- Run this in your Supabase SQL Editor

-- Step 1: Add the new city_name column
ALTER TABLE reset_history 
ADD COLUMN IF NOT EXISTS city_name TEXT;

-- Step 2: (Optional) If you want to keep old data, you can migrate existing coordinates to city names
-- This would require running reverse geocoding for each record, which is complex
-- For now, we'll just keep the old columns but use city_name going forward

-- Step 3: Remove old columns (only if you want to completely remove them)
-- Uncomment these lines if you want to remove the old coordinate columns:
-- ALTER TABLE reset_history DROP COLUMN IF EXISTS latitude;
-- ALTER TABLE reset_history DROP COLUMN IF EXISTS longitude;
-- ALTER TABLE reset_history DROP COLUMN IF EXISTS location_accuracy;

-- Note: The app will now use city_name for new resets
-- Old records will have NULL city_name but will still display "Location not available"
