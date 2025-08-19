-- Full DB schema for Synap (profiles + events)
-- Safe to run in Supabase SQL Editor. Drops and recreates tables/triggers/functions/policies.
-- IMPORTANT: Running this will DROP existing tables `public.events` and `public.profiles` if present.
-- If you have production data, back it up first.

-- Ensure gen_random_uuid is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing objects (safe if missing)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
DROP FUNCTION IF EXISTS public.update_events_updated_at();

DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==========================
-- profiles table and helpers
-- ==========================

-- Create profiles table to store user metadata
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  role text NOT NULL CHECK (role IN ('participant', 'judge', 'creator', 'organizer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx ON public.profiles (lower(email));

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies (created only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can read own profile'
  ) THEN
    EXECUTE $$CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)$$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    EXECUTE $$CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)$$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Service role can manage profiles'
  ) THEN
    EXECUTE $$CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role')$$;
  END IF;
END
$$;

-- Function to auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run the function after auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================
-- events table and helpers
-- ==========================

-- Create events table with all required columns
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Host/Creator Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  aadhar TEXT,
  organization TEXT,
  designation TEXT,
  -- Basic Event Information
  event_type TEXT NOT NULL DEFAULT 'event',
  event_title TEXT NOT NULL,
  event_description TEXT,
  start_date DATE,
  start_time TIME,
  end_date DATE,
  end_time TIME,
  number_of_mentors INTEGER DEFAULT 0,
  authorized_judges TEXT[] DEFAULT '{}',
  -- Hackathon Specific Fields
  hackathon_mode TEXT,
  venue TEXT,
  registration_deadline DATE,
  eligibility TEXT,
  min_team_size INTEGER,
  max_team_size INTEGER,
  max_participants INTEGER,
  themes TEXT,
  tracks TEXT[] DEFAULT '{}',
  submission_guidelines TEXT,
  evaluation_criteria TEXT,
  prize_details TEXT,
  participation_certificates BOOLEAN DEFAULT FALSE,
  -- Event Specific Fields
  event_category TEXT,
  event_mode TEXT,
  registration_fee NUMERIC(10,2),
  -- General Fields
  announcements TEXT[] DEFAULT '{}',
  event_code TEXT UNIQUE,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS events_email_idx ON public.events (email);
CREATE INDEX IF NOT EXISTS events_event_code_idx ON public.events (event_code);
CREATE INDEX IF NOT EXISTS events_event_type_idx ON public.events (event_type);
CREATE INDEX IF NOT EXISTS events_created_at_idx ON public.events (created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies (created only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Allow authenticated users to read events'
  ) THEN
    EXECUTE $$CREATE POLICY "Allow authenticated users to read events" ON public.events FOR SELECT USING (auth.role() = 'authenticated')$$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Service role can manage events'
  ) THEN
    EXECUTE $$CREATE POLICY "Service role can manage events" ON public.events FOR ALL USING (auth.role() = 'service_role')$$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Allow authenticated users to create events'
  ) THEN
    EXECUTE $$CREATE POLICY "Allow authenticated users to create events" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated')$$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Allow users to update own events'
  ) THEN
    EXECUTE $$CREATE POLICY "Allow users to update own events" ON public.events FOR UPDATE USING (auth.email() = email)$$;
  END IF;
END
$$;

-- Function to update updated_at for events
CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for events updated_at
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_events_updated_at();

-- Add any missing columns to existing table (safety checks)
DO $$ 
BEGIN
  -- Start and end time fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'start_time') THEN
    ALTER TABLE public.events ADD COLUMN start_time TIME;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'end_time') THEN
    ALTER TABLE public.events ADD COLUMN end_time TIME;
  END IF;
  -- Hackathon specific fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'hackathon_mode') THEN
    ALTER TABLE public.events ADD COLUMN hackathon_mode TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue') THEN
    ALTER TABLE public.events ADD COLUMN venue TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'registration_deadline') THEN
    ALTER TABLE public.events ADD COLUMN registration_deadline DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'eligibility') THEN
    ALTER TABLE public.events ADD COLUMN eligibility TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'min_team_size') THEN
    ALTER TABLE public.events ADD COLUMN min_team_size INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'max_team_size') THEN
    ALTER TABLE public.events ADD COLUMN max_team_size INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'max_participants') THEN
    ALTER TABLE public.events ADD COLUMN max_participants INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'themes') THEN
    ALTER TABLE public.events ADD COLUMN themes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'tracks') THEN
    ALTER TABLE public.events ADD COLUMN tracks TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'submission_guidelines') THEN
    ALTER TABLE public.events ADD COLUMN submission_guidelines TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'evaluation_criteria') THEN
    ALTER TABLE public.events ADD COLUMN evaluation_criteria TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'prize_details') THEN
    ALTER TABLE public.events ADD COLUMN prize_details TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'participation_certificates') THEN
    ALTER TABLE public.events ADD COLUMN participation_certificates BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_category') THEN
    ALTER TABLE public.events ADD COLUMN event_category TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_mode') THEN
    ALTER TABLE public.events ADD COLUMN event_mode TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'registration_fee') THEN
    ALTER TABLE public.events ADD COLUMN registration_fee NUMERIC(10,2);
  END IF;
END $$;

-- Done

