-- ================================================================
-- JobNinjas: FIX Evaluation Reports Table
-- Run this in the Supabase SQL Editor to add missing columns
-- ================================================================

-- Add missing columns to evaluation_reports
ALTER TABLE evaluation_reports
    ADD COLUMN IF NOT EXISTS strengths JSONB,
    ADD COLUMN IF NOT EXISTS gaps JSONB,
    ADD COLUMN IF NOT EXISTS repetition_feedback TEXT,
    ADD COLUMN IF NOT EXISTS rewritten_answers JSONB,
    ADD COLUMN IF NOT EXISTS role_fit_score INT;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'evaluation_reports';
