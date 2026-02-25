-- ================================================================
-- JobNinjas: FINAL Interview Schema Fix
-- This script ensures all interview tables exist and are correctly
-- configured for the MongoDB -> Supabase migration.
-- Run this in the Supabase SQL Editor.
-- ================================================================

-- 1. interview_resumes
CREATE TABLE IF NOT EXISTS interview_resumes (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID,  -- No FK on auth.users (users are in profiles/MongoDB)
    file_name   TEXT,
    parsed_text TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. interview_sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
    id               UUID PRIMARY KEY, -- We generate UUIDs in the app
    user_id          UUID,
    resume_id        UUID REFERENCES interview_resumes(id) ON DELETE SET NULL,
    job_description  TEXT,
    role_title       TEXT,
    status           TEXT DEFAULT 'pending',
    question_count   INT DEFAULT 0,
    target_questions INT DEFAULT 5,
    resume_text      TEXT, -- Redundancy
    report_id        UUID, -- Will link to evaluation_reports later
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 3. interview_turns
CREATE TABLE IF NOT EXISTS interview_turns (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id     UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    turn_number    INT NOT NULL,
    question_text  TEXT,
    answer_text    TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 4. evaluation_reports
CREATE TABLE IF NOT EXISTS evaluation_reports (
    id                  UUID PRIMARY KEY,
    session_id          UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    summary             TEXT,
    strengths           JSONB,
    gaps                JSONB,
    repetition_feedback TEXT,
    scores              JSONB,
    rewritten_answers   JSONB,
    role_fit_score      INT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Finalize constraints (Ensure no leftover auth.users FKs)
ALTER TABLE interview_resumes DROP CONSTRAINT IF EXISTS interview_resumes_user_id_fkey;
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_user_id_fkey;

-- 6. Add indices for performance
CREATE INDEX IF NOT EXISTS idx_turns_session ON interview_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON interview_sessions(user_id);

SELECT 'Interview Schema Finalized Successfully ✅' AS status;
