-- ================================================================
-- JobNinjas: Full Supabase Schema (MongoDB → Supabase Migration)
-- Run this in Supabase SQL Editor (safe to re-run — uses IF NOT EXISTS)
-- ================================================================

-- ----------------------------------------------------------------
-- 1. EXTEND profiles table with columns that were in MongoDB users
-- ----------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_token  TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by         TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_applications_bonus INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS byok_settings       JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan   TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_activated_at  TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_expires_at    TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_text         TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latest_resume       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS summary             TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture     TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_role         TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone               TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location            TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_url       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills              JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education           JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience          JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_authorization  TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences         JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified         BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan                TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role                TEXT DEFAULT 'customer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name                TEXT;

-- unique index on email (safe if already exists)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
-- unique index on referral_code
CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_idx ON profiles(referral_code) WHERE referral_code IS NOT NULL;

-- ----------------------------------------------------------------
-- 2. saved_resumes  (was db.resumes + db.saved_resumes)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_resumes (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_email  TEXT NOT NULL,
    name        TEXT,
    content     TEXT,
    file_type   TEXT DEFAULT 'text',
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS saved_resumes_email_idx ON saved_resumes(user_email);

-- ----------------------------------------------------------------
-- 3. byok_keys  (was db.byok_keys)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS byok_keys (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email    TEXT NOT NULL UNIQUE,
    provider      TEXT,
    encrypted_key JSONB,   -- {ciphertext, iv, tag}
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS byok_keys_email_idx ON byok_keys(user_email);

-- ----------------------------------------------------------------
-- 4. call_bookings  (was db.call_bookings)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS call_bookings (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name                TEXT NOT NULL,
    email               TEXT NOT NULL,
    mobile              TEXT,
    years_of_experience TEXT,
    status              TEXT DEFAULT 'pending',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 5. waitlist  (was db.waitlist)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS waitlist (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name         TEXT NOT NULL,
    email        TEXT NOT NULL UNIQUE,
    phone        TEXT,
    current_role TEXT,
    target_role  TEXT,
    urgency      TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 6. subscriptions  (was db.subscriptions)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email  TEXT NOT NULL,
    plan        TEXT,
    status      TEXT DEFAULT 'active',
    provider    TEXT,            -- razorpay, stripe, etc.
    provider_id TEXT,            -- payment provider's subscription/order ID
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS subscriptions_email_idx ON subscriptions(user_email);

-- ----------------------------------------------------------------
-- 7. webhook_events  (was db.webhook_events)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_events (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT,
    provider   TEXT,
    payload    JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 8. payments  (was db.payments)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email  TEXT NOT NULL,
    amount      NUMERIC,
    currency    TEXT DEFAULT 'INR',
    status      TEXT,
    provider    TEXT,
    provider_id TEXT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payments_email_idx ON payments(user_email);

-- ----------------------------------------------------------------
-- 9. status_checks  (was db.status_checks)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS status_checks (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 10. customer_assignments  (was db.customer_assignments)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_assignments (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email  TEXT NOT NULL,
    assigned_to TEXT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 11. daily_usage  (already in SupabaseService but create if missing)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_usage (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email   TEXT NOT NULL,
    date         TEXT NOT NULL,         -- YYYY-MM-DD
    resume_scans INT DEFAULT 0,
    ai_apply     INT DEFAULT 0,
    optimize     INT DEFAULT 0,
    interviews   INT DEFAULT 0,
    UNIQUE(user_email, date)
);
CREATE INDEX IF NOT EXISTS daily_usage_email_date_idx ON daily_usage(user_email, date);

-- ----------------------------------------------------------------
-- 12. Fix interview tables — drop auth.users FK (users are profiles)
-- ----------------------------------------------------------------
ALTER TABLE interview_resumes
    DROP CONSTRAINT IF EXISTS interview_resumes_user_id_fkey;
ALTER TABLE interview_sessions
    DROP CONSTRAINT IF EXISTS interview_sessions_user_id_fkey;
ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS role_title TEXT;
ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS resume_text TEXT;

-- ----------------------------------------------------------------
-- 13. scans table — ensure it exists with correct shape
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scans (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_email     TEXT,
    raw_text       TEXT,
    extracted_data JSONB,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS scans_email_idx ON scans(user_email);

-- ----------------------------------------------------------------
-- 14. applications  — ensure metadata column exists
-- ----------------------------------------------------------------
ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS job_title  TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS company    TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS job_url    TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS metadata   JSONB;
CREATE INDEX IF NOT EXISTS applications_email_idx ON applications(user_email);

-- ----------------------------------------------------------------
-- 15. Drop FK on interview_sessions.resume_id if it references resumes table
-- ----------------------------------------------------------------
ALTER TABLE interview_sessions
    DROP CONSTRAINT IF EXISTS interview_sessions_resume_id_fkey;

SELECT 'Schema migration complete ✅' AS result;
