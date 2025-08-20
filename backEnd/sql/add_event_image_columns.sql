-- Add image_url column to events table (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.events ADD COLUMN image_url TEXT;
  END IF;
END
$$;
