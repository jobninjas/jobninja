-- ============================================================
-- JobNinjas Interview Prep - Supabase Schema Migration
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Interview Resumes (uploaded resume text for each session)
CREATE TABLE IF NOT EXISTS interview_resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    file_name TEXT,
    parsed_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Interview Sessions (one per mock interview attempt)
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resume_id UUID REFERENCES interview_resumes(id) ON DELETE SET NULL,
    job_description TEXT,
    status TEXT DEFAULT 'pending',   -- pending | active | completed
    question_count INT DEFAULT 0,
    target_questions INT DEFAULT 5,
    report_id UUID,                  -- FK to evaluation_reports added below
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Interview Turns (individual Q&A pairs inside a session)
CREATE TABLE IF NOT EXISTS interview_turns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    turn_number INT NOT NULL,
    question_text TEXT,
    answer_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Evaluation Reports (AI-generated report after interview completes)
CREATE TABLE IF NOT EXISTS evaluation_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    summary TEXT,
    strengths JSONB DEFAULT '[]',
    gaps JSONB DEFAULT '[]',
    repetition_feedback TEXT,
    scores JSONB DEFAULT '{}',
    rewritten_answers JSONB DEFAULT '[]',
    role_fit_score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add the FK from sessions → reports (after both tables exist)
ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES evaluation_reports(id) ON DELETE SET NULL;

-- Optional: Disable Row Level Security for service_role key access
-- (The backend uses SUPABASE_SERVICE_ROLE_KEY, so it bypasses RLS automatically)
-- But enable RLS for user-facing reads if desired:
-- ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interview_resumes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interview_turns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE evaluation_reports ENABLE ROW LEVEL SECURITY;
