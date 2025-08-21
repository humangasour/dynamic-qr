# Dynamic QR

Dynamic QR is a web application for creating and managing **reprogrammable QR codes**.  
Each QR code points to a short link that the owner can **update anytime**, with a dashboard for basic scan analytics.

---

## Features (MVP)

- Sign up & authentication
- Create QR codes with editable redirect
- Download QR in SVG/PNG
- View scan analytics (totals, daily, top referrers, top countries)
- Dashboard for managing codes
- Free & Pro plans (Stripe Checkout)

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind, shadcn/ui, Radix
- **Backend**: Next.js API Routes + tRPC, Zod validation
- **Database**: Supabase (Postgres, Auth, Row Level Security, Storage)
- **Edge**: Vercel Edge Middleware for redirects
- **Payments**: Stripe
- **Analytics**: Supabase events + SQL views
- **Testing**: Vitest, Testing Library, Playwright
- **Observability**: Sentry

---

## Documentation

- [Product Spec](./docs/product-spec.md)

---

## Status

🚧 In development — see [Product Spec](./docs/product-spec.md) for MVP scope.

---

## License

[MIT](./LICENSE)
