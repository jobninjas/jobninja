-- ROBUST CONSTRAINT DROP FOR PROFILES
-- Run this in the Supabase SQL Editor

DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    -- 1. Find and drop ANY foreign key constraint on the 'id' column of 'profiles'
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.key_column_usage 
        WHERE table_name = 'profiles' 
        AND column_name = 'id' 
        AND table_schema = 'public'
        AND constraint_name LIKE '%fkey%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE';
        RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
    END LOOP;

    -- 2. Double check by dropping the specific name we saw in the error
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;
END $$;

SELECT 'Profiles constraint check completed! ✅ If you saw a Notice above, it means something was dropped.' AS result;
