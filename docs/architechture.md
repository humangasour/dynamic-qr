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

## 7. TypeScript Infrastructure

### 7.1 Generated Types

- **Database Types**: Auto-generated from Supabase schema (`src/types/database.ts`)
- **Type Safety**: Full TypeScript coverage for all database operations
- **Runtime Validation**: Type guards for enums and data validation

### 7.2 Database Helpers

- **CRUD Operations**: Type-safe functions for all tables (`src/lib/supabase/database-helpers.ts`)
- **Query Builders**: Simplified database interactions with full type safety
- **Error Handling**: Consistent error patterns across the app

### 7.3 Development Experience

- **IntelliSense**: Full autocomplete for database operations
- **Compile-time Safety**: Catch errors before runtime
- **Refactoring Support**: Safe database schema changes
- **Type Guards**: Runtime validation for database enums and user inputs

### 7.4 File Organization

```
src/types/
├── database.ts          # Generated Supabase types
├── type-guards.ts       # Runtime validation functions
└── index.ts            # Clean exports

src/lib/supabase/
├── client.ts           # Type-safe client
├── server.ts           # Server-side operations
├── utils.ts            # Client utilities
├── database-helpers.ts # CRUD helper functions
└── index.ts            # Main exports
```

## 8. CI/CD & Quality Assurance

### 8.1 Matrix CI Testing

**Purpose**: Ensure compatibility across multiple Node.js versions and comprehensive quality checks.

**Matrix Strategy**:

```yaml
# Tests across 3 Node.js versions simultaneously
- Node.js 18.x (LTS) - Production stability
- Node.js 20.x (LTS) - Current standard
- Node.js 22.x (Current) - Future compatibility
```

**Quality Gates**:

- **Format Checking**: Prettier code style validation
- **Linting**: ESLint rule enforcement
- **Type Checking**: TypeScript compilation verification
- **Build Verification**: Next.js build success validation
- **Security Audit**: npm audit for vulnerability detection

### 8.2 Pre-commit Hooks

- **Husky Integration**: Automated quality checks before commits
- **Lint-staged**: Only process changed files for efficiency
- **Type Safety**: Ensure TypeScript errors are caught early

### 8.3 Development Workflow

```bash
# Pre-commit (automatic)
git commit -m "message"  # Runs: format, lint, typecheck

# Manual quality checks
npm run check-all         # format + lint + typecheck + build

# CI/CD (automatic on PR)
# Matrix testing across Node.js versions
# Security audits and dependency checks
```
