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
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING ((select auth.uid()) = id);

-- Organization Members: Combined policy for viewing and managing members
CREATE POLICY "Users can view and manage org members" ON public.org_members
  FOR ALL USING (
    public.is_org_member(org_id) OR 
    public.has_org_role(org_id, 'owner')
  );

-- QR Codes: Combined policy for all operations on org QR codes
CREATE POLICY "Users can manage org QR codes" ON public.qr_codes
  FOR ALL USING (
    public.is_org_member(org_id) OR 
    status = 'active'  -- Allow public access to active QR codes for redirects
  );

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
-- Note: Public access to active QR codes is now handled in the combined policy above

-- Allow public access to scan events for analytics collection
CREATE POLICY "Public can insert scan events" ON public.scan_events
  FOR INSERT WITH CHECK (true);

-- ===== Comments for Documentation
COMMENT ON FUNCTION public.get_user_org_id() IS 'Get the current user''s primary organization ID';
COMMENT ON FUNCTION public.is_org_member(org_id UUID) IS 'Check if current user is a member of the specified organization';
COMMENT ON FUNCTION public.has_org_role(org_id UUID, required_role TEXT) IS 'Check if current user has the specified role in the organization';
