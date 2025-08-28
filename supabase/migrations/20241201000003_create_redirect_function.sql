-- ===== Migration: Create Redirect Function
-- This function handles public redirects and visit logging
-- It bypasses RLS for public access while maintaining security

-- ===== Create the redirect handling function
-- RPC to resolve slug and log a scan in one round-trip
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.handle_redirect(
  p_slug TEXT,
  p_ip TEXT,
  p_user_agent TEXT,
  p_referrer TEXT,
  p_country TEXT
) RETURNS TABLE(target_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_qr_id UUID;
  v_target TEXT;
BEGIN
  -- Look up active QR code by slug
  SELECT id, current_target_url
    INTO v_qr_id, v_target
  FROM public.qr_codes
  WHERE slug = p_slug AND status = 'active'
  LIMIT 1;

  -- If no active QR found, return empty result
  IF v_qr_id IS NULL THEN
    RETURN;
  END IF;

  -- Log the visit with all metadata
  INSERT INTO public.scan_events (qr_id, ts, ip_hash, user_agent, referrer, country)
  VALUES (
    v_qr_id,
    NOW(),
    encode(extensions.digest(convert_to(coalesce(p_ip,''), 'UTF8'), 'sha256'), 'hex'),
    LEFT(COALESCE(p_user_agent, ''), 512),
    LEFT(COALESCE(p_referrer, ''), 512),
    LEFT(COALESCE(p_country, ''), 64)
  );

  -- Return the target URL for redirect
  RETURN QUERY SELECT v_target;
END;
$$;

-- ===== Grant execute permissions
-- Allow anonymous and authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.handle_redirect(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.handle_redirect(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ===== Add function comment
COMMENT ON FUNCTION public.handle_redirect(TEXT, TEXT, TEXT, TEXT, TEXT) IS 'Handle public redirects by slug with comprehensive visit logging. Returns target URL and logs visit with IP hash, user agent, referrer, and country. Bypasses RLS for public access.';

-- ===== Create index for performance (if not already exists)
-- This ensures fast lookups by slug for active QR codes
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug_active 
ON public.qr_codes(slug) 
WHERE status = 'active';
