-- FINAL FIX FOR PROFILES TABLE (SIGNUP & ADMIN)
-- Run this in the Supabase SQL Editor

-- 1. Add missing authentication columns
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='password_hash') THEN
        ALTER TABLE profiles ADD COLUMN password_hash TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='verification_token') THEN
        ALTER TABLE profiles ADD COLUMN verification_token TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='referral_code') THEN
        ALTER TABLE profiles ADD COLUMN referral_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='referred_by') THEN
        ALTER TABLE profiles ADD COLUMN referred_by TEXT;
    END IF;
END $$;

-- 2. Drop the restrictive foreign key constraint
-- This allows our backend to manage profiles independently of Supabase Auth
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Ensure daily_usage setup (just in case)
CREATE TABLE IF NOT EXISTS daily_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    apps INTEGER DEFAULT 0,
    autofills INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email, date)
);

-- Ensure correct column name if it already exists but was wrong
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_usage' AND column_name='user_email') THEN
        ALTER TABLE daily_usage RENAME COLUMN user_email TO email;
    END IF;
END $$;

SELECT 'Final Profile & Signup fixes applied! ✅' AS result;
