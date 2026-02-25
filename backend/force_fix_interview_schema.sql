-- 1. Ensure interview_sessions has all required columns
ALTER TABLE interview_sessions 
    ADD COLUMN IF NOT EXISTS user_id UUID,
    ADD COLUMN IF NOT EXISTS resume_id UUID,
    ADD COLUMN IF NOT EXISTS question_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS target_questions INT DEFAULT 5,
    ADD COLUMN IF NOT EXISTS resume_text TEXT,
    ADD COLUMN IF NOT EXISTS report_id UUID,
    ADD COLUMN IF NOT EXISTS job_description TEXT,
    ADD COLUMN IF NOT EXISTS role_title TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. Ensure interview_resumes has required columns
ALTER TABLE interview_resumes
    ADD COLUMN IF NOT EXISTS parsed_text TEXT,
    ADD COLUMN IF NOT EXISTS file_name TEXT;

-- 3. Double check interview_turns table (just in case)
CREATE TABLE IF NOT EXISTS interview_turns (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id     UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    turn_number    INT NOT NULL,
    question_text  TEXT,
    answer_text    TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Double check evaluation_reports table
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

-- 5. Finalize constraints (Remove auth.users links)
ALTER TABLE interview_resumes DROP CONSTRAINT IF EXISTS interview_resumes_user_id_fkey;
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_user_id_fkey;

SELECT 'Schema Forced Fix Successful ✅' AS status;
