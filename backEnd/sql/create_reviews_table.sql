-- Idempotent migration: create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id text NOT NULL,
  score numeric,
  feedback text,
  reviewer_email text,
  reviewer_name text,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookup by submission
CREATE INDEX IF NOT EXISTS reviews_submission_id_idx ON reviews(submission_id);
CREATE INDEX IF NOT EXISTS reviews_reviewer_email_idx ON reviews(reviewer_email);
