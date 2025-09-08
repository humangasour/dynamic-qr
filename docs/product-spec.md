# Product Specification – Dynamic QR Codes MVP

## 1. Overview

A web application for creating and managing **dynamic QR codes**.  
Each QR code points to a short link that the owner can **update anytime**, without reprinting.  
The platform also provides **basic scan analytics** through a dashboard.

This MVP is intended as:

- A **portfolio project** to showcase product thinking and industry-grade engineering practices.
- A potential **foundation for monetization** via B2B/event-focused use cases.

---

## 2. Goals

- Build a **robust, accessible MVP** with clean architecture and best practices.
- Showcase full-stack development: Next.js, Supabase, tRPC, Tailwind, shadcn/ui.
- Provide a **complete SaaS flow**: sign up → create QR → scan → analytics → upgrade plan.
- Position for possible future expansion (events, merch, India SMBs).

---

## 3. In Scope (MVP)

- **Authentication & Orgs**
  - Sign up, login, logout.
  - Each user belongs to an org (multi-tenant).
  - (Optional later) invite teammates.

- **QR Creation**
  - Create QR with name; slug is auto‑generated (editable later).
  - Provide initial target URL.
  - Generate and download QR assets (SVG + PNG) from public storage.

- **Link Management**
  - Update target URL anytime.
  - Maintain version history and rollback.

- **Redirect Service**
  - Public short link (`/r/:slug`) with fast 302 redirect.
  - Redirect resolution is handled via tRPC → Supabase RPC (`handle_redirect`).
  - Log each scan event (timestamp, referrer, coarse geo, IP hash).

- **Analytics**
  - Total and unique scans.
  - Daily scans trend (sparkline).
  - Recent scans table.
  - Top referrers and top countries.
  - Export CSV.

- **Dashboard**
  - List of all QRs in org.
  - Detail page with history and analytics.

- **Billing**
  - Stripe Checkout.
  - Free plan: 3 active QRs, 30 days analytics.
  - Pro plan: 100 QRs, 1 year analytics, version history.

---

## 4. Out of Scope (for MVP)

- Bulk QR import (CSV).
- Custom domains for redirects.
- API keys, webhooks.
- White-label dashboards.
- Advanced analytics (device type, browser, funnels).
- Deep QR customization (logos, colors, themes).
- Internationalization (i18n).

---

## 5. Success Criteria

- A new user can:
  1. Sign up and create an org.
  2. Create a QR, download it, and scan it on their phone.
  3. Update the redirect and confirm it works immediately.
  4. View analytics update with scan counts and history.
- Supabase RLS ensures users cannot access other orgs’ data.
- All forms validated with Zod.
- UI passes basic accessibility checks (keyboard nav, labels, contrast).
- E2E test covers sign up → create → scan → edit → analytics.
- MVP deployed to Vercel + Supabase and demo-ready.

---

## 6. Risks & Assumptions

- **Traffic volume**: MVP will have low traffic, so direct DB reads are acceptable for redirects; edge caching can be added later.
- **Monetization**: Differentiation in market comes from positioning (events, merch, India-first pricing), not core tech.
- **Timeframe**: Targeting 6–8 focused dev days to MVP completion.
- **Privacy**: Only coarse analytics collected; IPs hashed to avoid PII storage.

---

## 7. Next Steps

✅ **COMPLETED:**

1. ~~Finalize architecture doc (tech stack, schema, RLS policies).~~
2. ~~Set up repo with Next.js, Supabase, tRPC, Tailwind, shadcn/ui.~~
3. ~~Begin with foundation tasks: auth + orgs + schema.~~
4. ~~Generate Supabase TS types and set up migrations with seed + RLS.~~
5. ~~Implement vertical slice for redirect flow~~
   - `/r/[slug]` route returns 302 to target URL via Next.js.
   - Public tRPC `public.redirect.handle` calls Supabase RPC `handle_redirect`.
   - Graceful fallback UI for missing/invalid slugs.
   - Unit + E2E coverage for redirect paths.
6. ~~Implement vertical slice for QR code generation~~
   - Server tRPC `qr.create` with Zod validation and slug uniqueness retries.
   - Generate SVG (vector) and PNG (print/preview) using `qrcode` library.
   - Upload assets to Supabase Storage bucket `qr-codes` as `orgId/qrId.{svg,png}` with long‑term caching.
   - Persist storage paths on `qr_codes` (columns: `svg_path`, `png_path`).
   - UI: Create page (`/qr/new`) and Details page (`/qr/[id]`) with preview, download, and copy‑to‑clipboard.

🎯 **NEXT:** 7. Link management: update target URL + version history (UI for `qr_versions`, rollback). 8. Analytics dashboard: totals, uniques, daily trend, recent scans, top referrers/countries, CSV export. 9. Billing: Stripe Checkout + plan limits (Free vs Pro) enforcement in API. 10. Performance: evaluate moving redirect to Edge Runtime; add CDN caching where safe. 11. Polish: accessibility pass, empty states, loading skeletons.

📋 **Notes:**

- Environment: set `APP_URL` (falls back to `NEXT_PUBLIC_APP_URL`) for server‑side URL construction and QR redirect URLs.
- Storage: public bucket `qr-codes` created with policies for public read and authenticated uploads.
