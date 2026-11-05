/*
# Public quote requests

1. New Tables
- `quote_requests`: one row per request submitted from the public "Request a Quote" form.
  Columns: id, created_at, full_name (required), phone (required), address (required),
  service_type, square_feet, preferred_date (all optional).

2. Security
- Row level security is enabled on `quote_requests`.
- Visitors (anon) and signed-in users may only INSERT a request, and only into the listed columns.
  Nobody can read, change, or delete rows directly through the browser.
- Check constraints cap field lengths and square footage so oversized submissions are rejected.
- Admin reads and deletes go through `list_quote_requests(text)` and `delete_quote_request(text, uuid)`.
  Both require the Admin PIN and reuse the existing PIN check, including the 5-attempt lockout.

3. Important notes
- The list function returns a JSON object with a `status` ('ok', 'invalid', or 'locked') and, when 'ok', a `requests` array newest first.
- The delete function returns the same status words.
*/

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 1 AND 120),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 30),
  address text NOT NULL CHECK (char_length(btrim(address)) BETWEEN 1 AND 300),
  service_type text CHECK (service_type IS NULL OR char_length(service_type) <= 120),
  square_feet numeric CHECK (square_feet IS NULL OR (square_feet > 0 AND square_feet <= 1000000)),
  preferred_date date
);

CREATE INDEX IF NOT EXISTS quote_requests_created_at_idx ON public.quote_requests (created_at DESC);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.quote_requests FROM PUBLIC, anon, authenticated;
GRANT INSERT (full_name, phone, address, service_type, square_feet, preferred_date)
  ON public.quote_requests TO anon, authenticated;

DROP POLICY IF EXISTS "public_insert_quote_requests" ON public.quote_requests;
CREATE POLICY "public_insert_quote_requests" ON public.quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.list_quote_requests(p_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  status text;
BEGIN
  status := public.check_admin_pin_internal(p_pin);
  IF status <> 'ok' THEN
    RETURN jsonb_build_object('status', status);
  END IF;

  RETURN jsonb_build_object(
    'status', 'ok',
    'requests', coalesce(
      (SELECT jsonb_agg(to_jsonb(q) ORDER BY q.created_at DESC) FROM public.quote_requests q),
      '[]'::jsonb
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_quote_request(p_pin text, p_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  status text;
BEGIN
  status := public.check_admin_pin_internal(p_pin);
  IF status <> 'ok' THEN
    RETURN status;
  END IF;

  DELETE FROM public.quote_requests WHERE id = p_id;
  RETURN 'ok';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.list_quote_requests(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_quote_request(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_quote_requests(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_quote_request(text, uuid) TO anon, authenticated;
