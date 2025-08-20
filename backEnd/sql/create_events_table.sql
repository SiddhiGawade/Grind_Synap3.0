-- Comprehensive Supabase events table schema
-- Run this in your Supabase SQL editor to create/update the events table

-- Drop existing table if you want to recreate it (CAUTION: This will delete all existing data)
-- DROP TABLE IF EXISTS public.events;

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
  hackathon_mode TEXT, -- 'online', 'offline', 'hybrid'
  venue TEXT,
  registration_deadline DATE,
  eligibility TEXT, -- 'open', 'students_only', 'professionals_only', etc.
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
  event_mode TEXT, -- 'online', 'offline', 'hybrid'
  registration_fee NUMERIC(10,2),
  
  -- General Fields
  announcements TEXT[] DEFAULT '{}',
  event_code TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_email_idx ON public.events (email);
CREATE INDEX IF NOT EXISTS events_event_code_idx ON public.events (event_code);
CREATE INDEX IF NOT EXISTS events_event_type_idx ON public.events (event_type);
CREATE INDEX IF NOT EXISTS events_created_at_idx ON public.events (created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow authenticated users to read all events
-- (Policies created below only if missing - Postgres doesn't support IF NOT EXISTS on CREATE POLICY)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Allow authenticated users to read events'
  ) THEN
    EXECUTE $$CREATE POLICY "Allow authenticated users to read events" ON public.events FOR SELECT USING (auth.role() = 'authenticated')$$;
  END IF;
END
$$;

-- Allow service role to manage all events (for backend operations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Service role can manage events'
  ) THEN
    EXECUTE $$CREATE POLICY "Service role can manage events" ON public.events FOR ALL USING (auth.role() = 'service_role')$$;
  END IF;
END
$$;

-- Allow users to insert events (for event creation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Allow authenticated users to create events'
  ) THEN
    EXECUTE $$CREATE POLICY "Allow authenticated users to create events" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated')$$;
  END IF;
END
$$;

-- Allow users to update their own events (check by email)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Allow users to update own events'
  ) THEN
    EXECUTE $$CREATE POLICY "Allow users to update own events" ON public.events FOR UPDATE USING (auth.email() = email)$$;
  END IF;
END
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on changes
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_events_updated_at();

-- Add any missing columns to existing table (if table already exists)
-- These are safe to run multiple times as they use IF NOT EXISTS

-- Basic event fields
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
  
  -- Event specific fields
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
