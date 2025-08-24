-- ===== Fix Function Security Issues
-- This migration fixes the search path security vulnerability in the update_updated_at_column function

-- Drop the existing function and triggers
DROP TRIGGER IF EXISTS update_orgs_updated_at ON public.orgs;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_qr_codes_updated_at ON public.qr_codes;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the triggers
CREATE TRIGGER update_orgs_updated_at 
  BEFORE UPDATE ON public.orgs 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at 
  BEFORE UPDATE ON public.qr_codes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
