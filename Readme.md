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

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

### Workflows

- **`ci.yml`** - Basic CI pipeline (linting, type checking, formatting, build)
- **`ci-advanced.yml`** - Advanced CI with matrix testing across Node.js versions and security checks
- **`deploy.yml`** - Deployment to Vercel (requires secrets setup)

### Local Development

Before pushing, ensure your code passes all checks:

```bash
# Check formatting
npm run format

# Lint code
npm run lint

# Type check
npm run typecheck

# Build
npm run build
```

### Required Secrets (for deployment)

If using the deploy workflow, add these secrets to your GitHub repository:

- `VERCEL_TOKEN` - Your Vercel API token
- `ORG_ID` - Your Vercel organization ID
- `PROJECT_ID` - Your Vercel project ID

---

## Documentation

- [Product Spec](./docs/product-spec.md)
- [Husky Workflow](./docs/husky-workflow.md)

---

## Status

🚧 In development — see [Product Spec](./docs/product-spec.md) for MVP scope.

---

## License

[MIT](./LICENSE)
