/*
# Admin PIN lock

1. New Tables
- `admin_security`: a single-row table (id = 1) holding the bcrypt hash of the Admin Mode PIN, the count of recent failed PIN attempts, and an optional lockout time.

2. Security
- Row level security is enabled on `admin_security` with no policies and no grants, so the browser can never read or write the PIN hash or counters directly.
- `verify_admin_pin(text)` and `change_admin_pin(text, text)` are the only public entry points. They run as the table owner and are the only code that touches the hash.
- Five consecutive wrong PINs lock Admin Mode for 15 minutes.

3. Important notes
- The default PIN is "1234". It is stored only as a hash.
- Functions return a status word ('ok', 'invalid', 'locked', or 'invalid_new') rather than raising errors, so failed attempts are recorded and not rolled back.
*/

CREATE TABLE IF NOT EXISTS public.admin_security (
  id integer PRIMARY KEY CHECK (id = 1),
  pin_hash text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_security ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_security FROM PUBLIC, anon, authenticated;

INSERT INTO public.admin_security (id, pin_hash)
VALUES (1, extensions.crypt('1234', extensions.gen_salt('bf')))
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.check_admin_pin_internal(p_pin text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  s public.admin_security%ROWTYPE;
BEGIN
  SELECT * INTO s FROM public.admin_security WHERE id = 1 FOR UPDATE;

  IF s.locked_until IS NOT NULL AND s.locked_until > now() THEN
    RETURN 'locked';
  END IF;

  IF p_pin IS NOT NULL AND p_pin ~ '^[0-9]{4}$' AND extensions.crypt(p_pin, s.pin_hash) = s.pin_hash THEN
    UPDATE public.admin_security
      SET failed_attempts = 0, locked_until = NULL, updated_at = now()
      WHERE id = 1;
    RETURN 'ok';
  END IF;

  IF s.failed_attempts + 1 >= 5 THEN
    UPDATE public.admin_security
      SET failed_attempts = 0, locked_until = now() + interval '15 minutes'
      WHERE id = 1;
    RETURN 'locked';
  END IF;

  UPDATE public.admin_security
    SET failed_attempts = s.failed_attempts + 1
    WHERE id = 1;
  RETURN 'invalid';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_admin_pin_internal(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_admin_pin(p_pin text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.check_admin_pin_internal(p_pin);
$$;

CREATE OR REPLACE FUNCTION public.change_admin_pin(p_current text, p_new text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  status text;
BEGIN
  status := public.check_admin_pin_internal(p_current);
  IF status <> 'ok' THEN
    RETURN status;
  END IF;

  IF p_new IS NULL OR p_new !~ '^[0-9]{4}$' THEN
    RETURN 'invalid_new';
  END IF;

  UPDATE public.admin_security
    SET pin_hash = extensions.crypt(p_new, extensions.gen_salt('bf')), updated_at = now()
    WHERE id = 1;
  RETURN 'ok';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_admin_pin(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.change_admin_pin(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_admin_pin(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.change_admin_pin(text, text) TO anon, authenticated;
