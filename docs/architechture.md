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
