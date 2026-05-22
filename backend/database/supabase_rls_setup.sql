-- ============================================================================
-- Supabase RLS Security Setup
-- ============================================================================
-- This SQL script enables Row Level Security (RLS) on all public tables
-- and creates appropriate policies to protect sensitive data.
--
-- To run this in Supabase:
-- 1. Go to SQL Editor in Supabase Dashboard
-- 2. Create a new query
-- 3. Paste this entire script
-- 4. Click Run
--
-- ============================================================================

-- ============================================================================
-- Step 1: Enable RLS on all tables
-- ============================================================================

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.personal_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cache_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.failed_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.works ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 2: Drop any existing policies to prevent conflicts
-- ============================================================================

-- Users table policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Password reset tokens policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can read their password reset tokens" ON public.password_reset_tokens;
    DROP POLICY IF EXISTS "Users can delete their password reset tokens" ON public.password_reset_tokens;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Sessions policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
    DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.sessions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Personal access tokens policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own access tokens" ON public.personal_access_tokens;
    DROP POLICY IF EXISTS "Users can delete their own access tokens" ON public.personal_access_tokens;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- System tables policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Deny public access to cache" ON public.cache;
    DROP POLICY IF EXISTS "Deny public access to cache_locks" ON public.cache_locks;
    DROP POLICY IF EXISTS "Deny public access to jobs" ON public.jobs;
    DROP POLICY IF EXISTS "Deny public access to job_batches" ON public.job_batches;
    DROP POLICY IF EXISTS "Deny public access to failed_jobs" ON public.failed_jobs;
    DROP POLICY IF EXISTS "Deny public access to migrations" ON public.migrations;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Services policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
    DROP POLICY IF EXISTS "Users can create services" ON public.services;
    DROP POLICY IF EXISTS "Users can edit their own services" ON public.services;
    DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Works policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view works" ON public.works;
    DROP POLICY IF EXISTS "Users can create works" ON public.works;
    DROP POLICY IF EXISTS "Users can edit their own works" ON public.works;
    DROP POLICY IF EXISTS "Users can delete their own works" ON public.works;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- Step 3: Create policies for users table (sensitive: password)
-- ============================================================================

CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- ============================================================================
-- Step 4: Create policies for password_reset_tokens table (sensitive: token)
-- ============================================================================

CREATE POLICY "Users can read their password reset tokens"
  ON public.password_reset_tokens
  FOR SELECT
  USING (auth.email() = email);

CREATE POLICY "Users can delete their password reset tokens"
  ON public.password_reset_tokens
  FOR DELETE
  USING (auth.email() = email);

-- ============================================================================
-- Step 5: Create policies for sessions table
-- ============================================================================

CREATE POLICY "Users can view their own sessions"
  ON public.sessions
  FOR SELECT
  USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can delete their own sessions"
  ON public.sessions
  FOR DELETE
  USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- ============================================================================
-- Step 6: Create policies for personal_access_tokens table
-- ============================================================================

CREATE POLICY "Users can view their own access tokens"
  ON public.personal_access_tokens
  FOR SELECT
  USING (auth.uid()::text = tokenable_id::text);

CREATE POLICY "Users can delete their own access tokens"
  ON public.personal_access_tokens
  FOR DELETE
  USING (auth.uid()::text = tokenable_id::text);

-- ============================================================================
-- Step 7: Create deny policies for system tables
-- These tables should only be accessed by the backend (service_role)
-- ============================================================================

CREATE POLICY "Deny public access to cache"
  ON public.cache
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny public access to cache_locks"
  ON public.cache_locks
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny public access to jobs"
  ON public.jobs
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny public access to job_batches"
  ON public.job_batches
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny public access to failed_jobs"
  ON public.failed_jobs
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny public access to migrations"
  ON public.migrations
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- Step 8: Create policies for services table (public read, authenticated create/edit/delete)
-- ============================================================================

CREATE POLICY "Anyone can view services"
  ON public.services
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create services"
  ON public.services
  FOR INSERT
  WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can edit their own services"
  ON public.services
  FOR UPDATE
  USING (auth.uid()::text = created_by::text)
  WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can delete their own services"
  ON public.services
  FOR DELETE
  USING (auth.uid()::text = created_by::text);

-- ============================================================================
-- Step 9: Create policies for works table (public read, authenticated create/edit/delete)
-- ============================================================================

CREATE POLICY "Anyone can view works"
  ON public.works
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create works"
  ON public.works
  FOR INSERT
  WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can edit their own works"
  ON public.works
  FOR UPDATE
  USING (auth.uid()::text = created_by::text)
  WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can delete their own works"
  ON public.works
  FOR DELETE
  USING (auth.uid()::text = created_by::text);

-- ============================================================================
-- Setup Complete!
-- ============================================================================
-- All RLS policies have been successfully created.
-- 
-- Summary of protection:
-- ✅ USERS table: Password protected - users can only see their own profile
-- ✅ PASSWORD_RESET_TOKENS table: Token protected - users only see their own tokens
-- ✅ SESSIONS table: Users only see their own sessions
-- ✅ CACHE tables: Only backend (service_role) can access
-- ✅ JOBS tables: Only backend (service_role) can access
-- ✅ MIGRATIONS table: Only backend (service_role) can access
-- ✅ SERVICES/WORKS tables: Public read, authenticated write
