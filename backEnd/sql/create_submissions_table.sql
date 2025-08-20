-- Idempotent Supabase/Postgres migration to create submissions table
-- Run in Supabase SQL editor or psql. Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'submissions') THEN
    CREATE TABLE public.submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID,
  event_title TEXT,
      team_name TEXT,
      submitter_name TEXT,
      submitter_email TEXT,
      link TEXT,
      files JSONB,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  CREATE INDEX IF NOT EXISTS submissions_event_id_idx ON public.submissions (event_id);
  CREATE INDEX IF NOT EXISTS submissions_event_title_idx ON public.submissions (event_title);
    CREATE INDEX IF NOT EXISTS submissions_team_name_idx ON public.submissions (team_name);
    CREATE INDEX IF NOT EXISTS submissions_submitter_email_idx ON public.submissions (submitter_email);
  END IF;
END
$$;

-- Add any missing columns safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'files') THEN
    ALTER TABLE public.submissions ADD COLUMN files JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'metadata') THEN
    ALTER TABLE public.submissions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END
$$;
