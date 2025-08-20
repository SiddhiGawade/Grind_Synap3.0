-- idempotent migration: create registrations table
-- Ensure pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'registrations') THEN
    CREATE TABLE public.registrations (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id uuid,
      event_code text,
      team_name text,
      registrant_email text NOT NULL,
      registrant_name text,
      role text,
      metadata jsonb,
      created_at timestamptz DEFAULT now()
    );
    CREATE INDEX ON public.registrations (event_id);
    CREATE INDEX ON public.registrations (registrant_email);
    -- participants: array of objects { name, email, metadata }
    DO $$ BEGIN
      ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS participants jsonb;
    EXCEPTION WHEN undefined_column THEN
      -- ignore
    END$$;
  END IF;
END$$;
