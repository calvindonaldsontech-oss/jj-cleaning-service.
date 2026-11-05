/*
# Add email column to quote_requests

1. Modified Tables
- `quote_requests`: adds `email` column (text, NOT NULL, max 254 chars).
  New public submissions include the client's email address so the admin
  can deliver the outbound estimate.

2. Security
- The insert-only column grant is extended to include `email`.
- Existing rows are backfilled with empty string so the NOT NULL constraint applies safely.
- A max-length CHECK is enforced; email format validation is handled in the app layer.
*/

ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '';

UPDATE public.quote_requests SET email = '' WHERE email IS NULL;

ALTER TABLE public.quote_requests
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN email DROP DEFAULT;

ALTER TABLE public.quote_requests
  DROP CONSTRAINT IF EXISTS quote_requests_email_check;
ALTER TABLE public.quote_requests
  ADD CONSTRAINT quote_requests_email_check CHECK (char_length(email) <= 254);

REVOKE INSERT ON public.quote_requests FROM anon, authenticated;
GRANT INSERT (full_name, email, phone, address, service_type, square_feet, preferred_date)
  ON public.quote_requests TO anon, authenticated;
