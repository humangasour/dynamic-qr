-- ===== Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== Enums
DO $$ BEGIN
  CREATE TYPE plan_t AS ENUM ('free', 'pro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE member_role_t AS ENUM ('owner', 'admin', 'editor', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE qr_status_t AS ENUM ('active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== Tables

-- Organizations
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan plan_t NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users (mirror of auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization membership
CREATE TABLE IF NOT EXISTS public.org_members (
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role member_role_t NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- QR codes
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,                -- globally unique for MVP
  current_target_url TEXT NOT NULL,
  status qr_status_t NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slug)
);

-- Version history (append-only)
CREATE TABLE IF NOT EXISTS public.qr_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  note TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scan events (write-only from redirect service)
CREATE TABLE IF NOT EXISTS public.scan_events (
  id BIGSERIAL PRIMARY KEY,
  qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_hash TEXT,                      -- store hash, not raw IP for privacy
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT
);

-- Daily aggregates (precomputed for performance)
CREATE TABLE IF NOT EXISTS public.daily_aggregates (
  qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  scans INTEGER NOT NULL DEFAULT 0,
  uniques INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (qr_id, day)
);

-- ===== Indexes
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_org_id ON public.qr_codes(org_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status_active ON public.qr_codes(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_qr_versions_qr_created ON public.qr_versions(qr_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_events_qr_ts ON public.scan_events(qr_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_scan_events_referrer ON public.scan_events(referrer);
CREATE INDEX IF NOT EXISTS idx_scan_events_geo ON public.scan_events(country, city);

-- ===== Triggers for updated_at timestamps
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

-- Apply updated_at trigger to tables that need it
CREATE TRIGGER update_orgs_updated_at 
  BEFORE UPDATE ON public.orgs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at 
  BEFORE UPDATE ON public.qr_codes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_aggregates ENABLE ROW LEVEL SECURITY;

-- ===== Comments for documentation
COMMENT ON TABLE public.orgs IS 'Organizations that can create and manage QR codes';
COMMENT ON TABLE public.users IS 'User profiles linked to Supabase auth.users';
COMMENT ON TABLE public.org_members IS 'Many-to-many relationship between users and organizations with roles';
COMMENT ON TABLE public.qr_codes IS 'QR codes created by organizations';
COMMENT ON TABLE public.qr_versions IS 'Version history of QR code target URLs for rollback capability';
COMMENT ON TABLE public.scan_events IS 'Individual scan events for analytics';
COMMENT ON TABLE public.daily_aggregates IS 'Precomputed daily scan statistics for dashboard performance';
