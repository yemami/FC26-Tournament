-- Migration script to update existing reset_history table
-- Run this in your Supabase SQL Editor to add city_name column

-- Add the new city_name column (if it doesn't exist)
ALTER TABLE reset_history 
ADD COLUMN IF NOT EXISTS city_name TEXT;

-- The old columns (latitude, longitude, location_accuracy) will remain
-- but the app will now use city_name for new resets
-- Old records will have NULL city_name and will display "Location not available"
