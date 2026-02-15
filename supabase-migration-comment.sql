-- Add optional comment column to matches table
-- Run this in Supabase SQL Editor if you already have the base schema

ALTER TABLE matches ADD COLUMN IF NOT EXISTS comment TEXT;
