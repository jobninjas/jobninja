-- Add missing columns to saved_resumes table
-- Run this in the Supabase SQL Editor

-- 1. Add user_email if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saved_resumes' AND column_name='user_email') THEN
        ALTER TABLE saved_resumes ADD COLUMN user_email TEXT;
    END IF;
END $$;

-- 2. Add file_name if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saved_resumes' AND column_name='file_name') THEN
        ALTER TABLE saved_resumes ADD COLUMN file_name TEXT;
    END IF;
END $$;

-- 3. Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_saved_resumes_user_email ON saved_resumes(user_email);

-- 4. Set up RLS (Row Level Security) if not already active
-- This assumes public access for now as per previous configurations, but ideally should be authenticated
ALTER TABLE saved_resumes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'saved_resumes' AND policyname = 'Allow public access to saved_resumes'
    ) THEN
        CREATE POLICY "Allow public access to saved_resumes" ON "public"."saved_resumes"
        AS PERMISSIVE FOR ALL
        TO public
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 5. Comments for clarity
COMMENT ON COLUMN saved_resumes.user_email IS 'User email address for unified lookups across services';
COMMENT ON COLUMN saved_resumes.file_name IS 'Original filename of the uploaded resume';
