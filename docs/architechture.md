# Architecture – Dynamic QR (MVP)

## 1. Goals

- Ship an industry‑grade MVP with a small but solid core.
- Keep latency low on redirects and keep the dashboard clean and accessible.
- Make choices that are easy to explain in interviews.

## 2. High‑level System

- **Web app**: Next.js 14 (App Router), React 18, TypeScript, Tailwind, shadcn/ui, Radix.
- **Backend**: Next.js server actions and API routes with tRPC and Zod validation.
- **Database**: Supabase Postgres with Row Level Security (RLS).
- **Auth**: Supabase Auth (email, OAuth later).
- **Storage**: Supabase Storage for QR assets (SVG, PNG).
- **Redirect edge**: Vercel Edge Middleware on `r.<domain>` for fast 302 and event fire‑and‑forget.
- **Jobs**: Supabase cron for nightly analytics aggregation.
- **Payments**: Stripe Checkout, a single Pro plan at launch.
- **Observability**: Sentry for FE and BE, basic structured logs.

## 3. Data Model (MVP)

All data is multi‑tenant by `org_id`. Version history enables rollbacks.

```text
users
  id (uuid, pk), email, name, created_at

orgs
  id (uuid, pk), name, plan (enum: free|pro), created_at

org_members
  org_id (fk), user_id (fk), role (enum: owner|admin|editor|viewer), created_at
  pk: (org_id, user_id)

qr_codes
  id (uuid, pk), org_id (fk), name, slug (unique), current_target_url, status (active|archived),
  created_by (fk -> users.id), created_at

qr_versions
  id (uuid, pk), qr_id (fk), target_url, note, created_by, created_at

scan_events
  id (bigint, pk), qr_id (fk), ts (timestamptz),
  ip_hash (text), ua (text), referrer (text), country (text), city (text)

-- created later when volume grows
daily_aggregates
  qr_id (fk), day (date), scans (int), uniques (int)
  pk: (qr_id, day)
```

## 4. Security Architecture

### 4.1 Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies ensuring multi-tenant data isolation.

### 4.2 Security Functions

```sql
-- Core security functions for RLS policies
get_user_org_id()           -- Returns current user's organization ID
is_org_member(org_id)       -- Checks if user belongs to organization
has_org_role(org_id, role)  -- Checks user's role in organization
```

### 4.3 Access Control Matrix

| Resource             | Owner       | Admin       | Editor      | Viewer      | Public           |
| -------------------- | ----------- | ----------- | ----------- | ----------- | ---------------- |
| **Organizations**    | Full CRUD   | View        | View        | View        | None             |
| **Users**            | Own profile | Own profile | Own profile | Own profile | None             |
| **QR Codes**         | Full CRUD   | Full CRUD   | Full CRUD   | View        | Read active only |
| **QR Versions**      | Full CRUD   | Full CRUD   | Full CRUD   | View        | None             |
| **Scan Events**      | View        | View        | View        | View        | Insert only      |
| **Daily Aggregates** | View        | View        | View        | View        | None             |

### 4.4 Public Access Policies

- **Redirect Service**: Public read access to active QR codes
- **Analytics Collection**: Public insert access to scan events
- **Dashboard**: Authenticated users see only their org's data

## 5. Database Schema Details

### 5.1 Extensions & Enums

```sql
-- Extensions
uuid-ossp, pgcrypto

-- Enums
plan_t: 'free' | 'pro'
member_role_t: 'owner' | 'admin' | 'editor' | 'viewer'
qr_status_t: 'active' | 'archived'
```

### 5.2 Performance Indexes

- **Organization queries**: `idx_qr_codes_org_id`, `idx_org_members_user_id`
- **QR lookups**: `idx_qr_codes_slug`, `idx_qr_codes_status_active`
- **Analytics**: `idx_scan_events_qr_ts`, `idx_scan_events_geo`
- **Versioning**: `idx_qr_versions_qr_created`

### 5.3 Automatic Timestamps

Triggers automatically update `updated_at` columns on all relevant tables.

## 6. Development Workflow

### 6.1 Local Development

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Generate new migrations
supabase db diff --schema public -f description
```

### 6.2 Migration Strategy

- **Schema-first approach**: Define complete schema in `schema.sql`
- **Automatic migration generation**: Supabase CLI creates migration files
- **Version control**: All schema changes tracked in git
- **Rollback capability**: Can revert to any migration point

### 6.3 Security Best Practices

- **SECURITY DEFINER**: All functions use proper security context
- **Explicit search paths**: Functions set `search_path = ''` for security
- **RLS policies**: Comprehensive access control at database level
- **Input validation**: Zod schemas for API validation
