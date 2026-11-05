/*
# Add bedrooms, bathrooms, notes to quote_requests

1. Modified Tables
- `quote_requests`: adds `bedrooms` (int, required, default 0),
  `bathrooms` (int, required, default 0), and `notes` (text, optional, default '').
  These values flow into the estimate formula and are stored with the lead record.
- Existing rows are backfilled with safe defaults so NOT NULL constraints apply.

2. Security
- The insert-only column grant is extended to include the three new columns.
*/

ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS bedrooms integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bathrooms integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';

UPDATE public.quote_requests SET bedrooms = 0 WHERE bedrooms IS NULL;
UPDATE public.quote_requests SET bathrooms = 0 WHERE bathrooms IS NULL;
UPDATE public.quote_requests SET notes = '' WHERE notes IS NULL;

ALTER TABLE public.quote_requests
  ALTER COLUMN bedrooms DROP DEFAULT,
  ALTER COLUMN bathrooms DROP DEFAULT,
  ALTER COLUMN notes DROP DEFAULT;

ALTER TABLE public.quote_requests
  DROP CONSTRAINT IF EXISTS quote_requests_bedrooms_check,
  DROP CONSTRAINT IF EXISTS quote_requests_bathrooms_check,
  DROP CONSTRAINT IF EXISTS quote_requests_notes_check;
ALTER TABLE public.quote_requests
  ADD CONSTRAINT quote_requests_bedrooms_check CHECK (bedrooms >= 0 AND bedrooms <= 50),
  ADD CONSTRAINT quote_requests_bathrooms_check CHECK (bathrooms >= 0 AND bathrooms <= 50),
  ADD CONSTRAINT quote_requests_notes_check CHECK (char_length(notes) <= 2000);

REVOKE INSERT ON public.quote_requests FROM anon, authenticated;
GRANT INSERT (full_name, email, phone, address, service_type, square_feet, preferred_date, bedrooms, bathrooms, notes)
  ON public.quote_requests TO anon, authenticated;
