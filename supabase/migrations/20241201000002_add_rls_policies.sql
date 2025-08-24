-- ===== Row Level Security (RLS) Policies
-- This migration adds RLS policies to ensure multi-tenant data isolation
-- Users can only access data from organizations they belong to

-- ===== Helper Functions

-- Function to get the current user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT om.org_id INTO org_id
  FROM public.org_members om
  WHERE om.user_id = auth.uid()
  LIMIT 1;
  
  RETURN org_id;
END;
$$;

-- Function to check if user is a member of a specific organization
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = $1 AND om.user_id = auth.uid()
  );
END;
$$;

-- Function to check if user has a specific role in an organization
CREATE OR REPLACE FUNCTION public.has_org_role(org_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = $1 
      AND om.user_id = auth.uid()
      AND om.role = $2
  );
END;
$$;

-- ===== RLS Policies

-- Organizations: Users can only see orgs they belong to
CREATE POLICY "Users can view their organizations" ON public.orgs
  FOR SELECT USING (public.is_org_member(id));

CREATE POLICY "Org owners can update their organizations" ON public.orgs
  FOR UPDATE USING (public.has_org_role(id, 'owner'));

CREATE POLICY "Org owners can delete their organizations" ON public.orgs
  FOR DELETE USING (public.has_org_role(id, 'owner'));

-- Users: Users can only see their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Organization Members: Users can see members of orgs they belong to
CREATE POLICY "Users can view org members" ON public.org_members
  FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Org owners can manage members" ON public.org_members
  FOR ALL USING (public.has_org_role(org_id, 'owner'));

-- QR Codes: Users can only access QRs from their organizations
CREATE POLICY "Users can view org QR codes" ON public.qr_codes
  FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Users can create QR codes in their org" ON public.qr_codes
  FOR INSERT WITH CHECK (public.is_org_member(org_id));

CREATE POLICY "Users can update QR codes in their org" ON public.qr_codes
  FOR UPDATE USING (public.is_org_member(org_id));

CREATE POLICY "Users can delete QR codes in their org" ON public.qr_codes
  FOR DELETE USING (public.is_org_member(org_id));

-- QR Versions: Users can only access versions of QRs from their organizations
CREATE POLICY "Users can view QR versions" ON public.qr_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.qr_codes qr
      WHERE qr.id = qr_id AND public.is_org_member(qr.org_id)
    )
  );

CREATE POLICY "Users can create QR versions" ON public.qr_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.qr_codes qr
      WHERE qr.id = qr_id AND public.is_org_member(qr.org_id)
    )
  );

-- Scan Events: Users can only see scan data for QRs from their organizations
CREATE POLICY "Users can view scan events" ON public.scan_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.qr_codes qr
      WHERE qr.id = qr_id AND public.is_org_member(qr.org_id)
    )
  );

-- Daily Aggregates: Users can only see aggregates for QRs from their organizations
CREATE POLICY "Users can view daily aggregates" ON public.daily_aggregates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.qr_codes qr
      WHERE qr.id = qr_id AND public.is_org_member(qr.org_id)
    )
  );

-- ===== Public Access for Redirect Service

-- Allow public access to QR codes for redirect service (read-only)
CREATE POLICY "Public can view active QR codes for redirects" ON public.qr_codes
  FOR SELECT USING (status = 'active');

-- Allow public access to scan events for analytics collection
CREATE POLICY "Public can insert scan events" ON public.scan_events
  FOR INSERT WITH CHECK (true);

-- ===== Comments for Documentation
COMMENT ON FUNCTION public.get_user_org_id() IS 'Get the current user''s primary organization ID';
COMMENT ON FUNCTION public.is_org_member(org_id UUID) IS 'Check if current user is a member of the specified organization';
COMMENT ON FUNCTION public.has_org_role(org_id UUID, required_role TEXT) IS 'Check if current user has the specified role in the organization';
