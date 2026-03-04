-- ================================================================
-- JobNinjas: Row Level Security (RLS) Implementation
-- This script enables RLS and defines security policies for 
-- reported tables to prevent unauthorized data exposure.
-- Run this in the Supabase SQL Editor.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Enable RLS on all target tables
-- ----------------------------------------------------------------
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE byok_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 2. Define Policies
-- ----------------------------------------------------------------

-- PROFILES: Users can manage their own profile
CREATE POLICY "Users can manage their own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- SAVED_RESUMES: User-owned access via user_id
CREATE POLICY "Users can manage their own resumes" ON saved_resumes
    FOR ALL USING (auth.uid() = user_id);

-- BYOK_KEYS: Email-based access
CREATE POLICY "Users can manage their own byok keys" ON byok_keys
    FOR ALL USING (auth.jwt() ->> 'email' = user_email);

-- PAYMENTS: Email-based access
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- SUBSCRIPTIONS: Email-based access
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- DAILY_USAGE: Email-based access
CREATE POLICY "Users can view their own daily usage" ON daily_usage
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- CONTACT_MESSAGES: Email-based access (Select only for user, insert for all)
CREATE POLICY "Anyone can submit contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own contact messages" ON contact_messages
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- CALL_BOOKINGS: Email-based access
CREATE POLICY "Anyone can book a call" ON call_bookings
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own call bookings" ON call_bookings
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- WAITLIST: Email-based access
CREATE POLICY "Anyone can join waitlist" ON waitlist
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own waitlist status" ON waitlist
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- SCANS: User-owned access via user_id
CREATE POLICY "Users can manage their own scans" ON scans
    FOR ALL USING (auth.uid() = user_id);

-- JOBS: Public Read, Service/Admin Write
CREATE POLICY "Public can view jobs" ON jobs
    FOR SELECT USING (true);
-- (Other operations default to service_role only when RLS is enabled without a policy for others)

-- INTERVIEW_SESSIONS: User-owned access via user_id
CREATE POLICY "Users can manage their own interview sessions" ON interview_sessions
    FOR ALL USING (auth.uid() = user_id);

-- EVALUATION_REPORTS: Linked to interview_sessions ownership
CREATE POLICY "Users can view reports for their own sessions" ON evaluation_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM interview_sessions s 
            WHERE s.id = evaluation_reports.session_id 
            AND s.user_id = auth.uid()
        )
    );

-- JOB_SYNC_STATUS: Authenticated Read-only
CREATE POLICY "Authenticated users can view sync status" ON job_sync_status
    FOR SELECT TO authenticated USING (true);

-- INTERVIEW_RESUMES: User-owned access via user_id
CREATE POLICY "Users can manage their own interview resumes" ON interview_resumes
    FOR ALL USING (auth.uid() = user_id);

-- USER_CONSENTS: Email-based access
CREATE POLICY "Users can manage their own consents" ON user_consents
    FOR ALL USING (auth.jwt() ->> 'email' = email);

-- APPLICATIONS: User-owned access via user_id
CREATE POLICY "Users can manage their own applications" ON applications
    FOR ALL USING (auth.uid() = user_id);

-- INTERVIEW_TURNS: Linked to interview_sessions ownership
CREATE POLICY "Users can manage turns for their own sessions" ON interview_turns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM interview_sessions s 
            WHERE s.id = interview_turns.session_id 
            AND s.user_id = auth.uid()
        )
    );

SELECT 'Row Level Security enabled and policies applied successfully ✅' AS status;
