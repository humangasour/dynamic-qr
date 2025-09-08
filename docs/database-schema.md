# Database Schema & Security – Dynamic QR

## Overview

This document details the complete database schema, Row Level Security (RLS) policies, and security architecture for the Dynamic QR MVP. The database is designed as a multi-tenant system where users can only access data from organizations they belong to.

## Database Structure

### Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Cryptographic functions
```

### Enums

```sql
-- Organization subscription plans
CREATE TYPE plan_t AS ENUM ('free', 'pro');

-- User roles within organizations
CREATE TYPE member_role_t AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- QR code status
CREATE TYPE qr_status_t AS ENUM ('active', 'archived');
```

## Tables

### 1. Organizations (`public.orgs`)

```sql
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan plan_t NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: Core entity representing organizations that can create and manage QR codes.

**RLS Policies**:

- Users can only view organizations they belong to
- Only owners can update/delete their organizations

### 2. Users (`public.users`)

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: User profiles linked to Supabase authentication.

**RLS Policies**:

- Users can only view and update their own profile

### 3. Organization Members (`public.org_members`)

```sql
CREATE TABLE public.org_members (
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role member_role_t NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);
```

**Purpose**: Many-to-many relationship between users and organizations with role-based access.

**RLS Policies**:

- Users can view members of organizations they belong to
- Only owners can manage (add/remove/update) members

### 4. QR Codes (`public.qr_codes`)

```sql
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  current_target_url TEXT NOT NULL,
  status qr_status_t NOT NULL DEFAULT 'active',
  -- Public storage asset paths (if generated)
  svg_path TEXT, -- e.g., org-uuid/qr-uuid.svg
  png_path TEXT, -- e.g., org-uuid/qr-uuid.png
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: QR codes created by organizations with unique slugs for redirects.

**RLS Policies**:

- Users can only access QR codes from their organizations
- Public read access for active QR codes (redirect service)

**Notes**:

- When QR assets are generated, their storage paths are persisted on the row via `svg_path` and `png_path`.
- Public asset URLs are derived from these paths via Supabase Storage `getPublicUrl`.

### 5. QR Versions (`public.qr_versions`)

```sql
CREATE TABLE public.qr_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  note TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: Version history of QR code target URLs for rollback capability.

**RLS Policies**:

- Users can only access versions of QR codes from their organizations

### 6. Scan Events (`public.scan_events`)

```sql
CREATE TABLE public.scan_events (
  id BIGSERIAL PRIMARY KEY,
  qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT
);
```

**Purpose**: Individual scan events for analytics and insights.

**RLS Policies**:

- Users can only view scan events for QR codes from their organizations
- Public insert access for analytics collection

### 7. Daily Aggregates (`public.daily_aggregates`)

```sql
CREATE TABLE public.daily_aggregates (
  qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  scans INTEGER NOT NULL DEFAULT 0,
  uniques INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (qr_id, day)
);
```

**Purpose**: Precomputed daily scan statistics for dashboard performance.

**RLS Policies**:

- Users can only view aggregates for QR codes from their organizations

## Security Functions

### Core Security Functions

```sql
-- Get current user's organization ID
CREATE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

-- Check if user is member of organization
CREATE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

-- Check if user has specific role in organization
CREATE FUNCTION public.has_org_role(org_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';
```

### Automatic Timestamp Function

```sql
-- Update updated_at column automatically
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';
```

## Performance Indexes

### Organization & User Queries

```sql
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX idx_qr_codes_org_id ON public.qr_codes(org_id);
```

### QR Code Lookups

```sql
CREATE INDEX idx_qr_codes_slug ON public.qr_codes(slug);
CREATE INDEX idx_qr_codes_status_active ON public.qr_codes(status) WHERE status = 'active';
```

### Analytics Performance

```sql
CREATE INDEX idx_scan_events_qr_ts ON public.scan_events(qr_id, ts DESC);
CREATE INDEX idx_scan_events_referrer ON public.scan_events(referrer);
CREATE INDEX idx_scan_events_geo ON public.scan_events(country, city);
```

### Version History

```sql
CREATE INDEX idx_qr_versions_qr_created ON public.qr_versions(qr_id, created_at DESC);
```

## Storage Buckets

### QR Code Assets (bucket: `qr-codes`)

```sql
-- Bucket configuration (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'qr-codes',
  'qr-codes',
  true,
  5242880, -- 5MB limit
  ARRAY['image/svg+xml', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies (idempotent)
-- Public can view QR code assets
CREATE POLICY "Public can view QR codes"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'qr-codes');

-- Authenticated users can upload/update/delete their own objects in this bucket
CREATE POLICY "Authenticated users can upload QR codes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'qr-codes');

CREATE POLICY "Users can update their own QR codes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'qr-codes' AND owner = auth.uid());

CREATE POLICY "Users can delete their own QR codes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'qr-codes' AND owner = auth.uid());
```

**Purpose**: Store generated QR assets (SVG/PNG) at `orgId/qrId.svg|png` with public read and authenticated write.

## Row Level Security Policies

### Organizations

- **SELECT**: Users can only see organizations they belong to
- **UPDATE/DELETE**: Only owners can modify their organizations

### Users

- **SELECT/UPDATE**: Users can only access their own profile

### QR Codes

- **SELECT**: Users see QR codes from their organizations + public active QRs
- **INSERT/UPDATE/DELETE**: Users can manage QRs in their organizations

### Scan Events

- **SELECT**: Users see scan data for their org's QRs
- **INSERT**: Public access for analytics collection

## Data Privacy Features

### IP Address Hashing

- Raw IP addresses are never stored
- Only hashed versions are kept for analytics
- Prevents PII storage while maintaining functionality

### Multi-Tenant Isolation

- Users cannot access data from other organizations
- All queries are automatically filtered by organization
- Role-based access control within organizations

## Development & Deployment

### Local Development

```bash
# Start local Supabase
supabase start

# Apply all migrations
supabase db reset

# Check for schema changes
supabase db diff --schema public
```

### Production Deployment

```bash
# Deploy to production
supabase db push --db-url $PRODUCTION_DB_URL
```

### Migration Management

- All schema changes are version-controlled
- Migrations are applied in chronological order
- Rollback capability to any previous state

### TypeScript Integration

```bash
# After schema changes, regenerate types
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/database.ts

# Run type checks
npm run typecheck

# Verify no TypeScript errors
tsc --noEmit
```

### Security Validation

- **Function Security**: All functions use `SECURITY DEFINER` and `SET search_path = ''`
- **RLS Testing**: Policies tested with sample data in local environment
- **Production Security**: Security issues automatically flagged in Supabase Studio

## Security Best Practices

1. **SECURITY DEFINER**: All functions use proper security context
2. **Explicit Search Paths**: Functions set `search_path = ''` to prevent injection
3. **RLS First**: Access control at database level, not just application level
4. **Input Validation**: Zod schemas for API validation
5. **Audit Trail**: All changes tracked with timestamps and user attribution
