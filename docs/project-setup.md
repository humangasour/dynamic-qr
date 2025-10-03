# Project Setup

This guide walks through installing dependencies, configuring local services, and running the Dynamic QR application in development.

## 1. Prerequisites

Make sure the following tools are installed:

- **Node.js** 20 LTS or newer
- **npm** 10 or newer (bundled with Node.js 20)
- **Supabase CLI** `>= 1.200.0` (required for local database/auth)
- **Git** (for cloning the repository)

> ℹ️ If you are not planning to run the Supabase stack locally, you can skip the Supabase CLI. You will, however, need credentials for a hosted Supabase project.

## 2. Clone the repository and install dependencies

```bash
# Clone the repository
 git clone https://github.com/<your-org>/dynamic-qr.git
 cd dynamic-qr

# Install dependencies
 npm install
```

## 3. Configure environment variables

Create a `.env.local` file in the project root and populate it with your Supabase credentials. These values are required whether you are using a hosted project or the local Supabase stack started via the CLI.

```bash
cp .env.local.example .env.local # if you have created a template, otherwise create manually
```

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"      # URL of your Supabase project/API
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"         # Public anonymous key
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"     # Service role key (keep secret)
NEXT_PUBLIC_APP_URL="http://localhost:3000"           # Base URL used in client code
APP_URL="http://localhost:3000"                       # Base URL used on the server (optional override)
```

- When running Supabase locally, the CLI will output the `anon`, `service_role`, and API URL values after `supabase start`. Copy them into `.env.local`.
- For hosted Supabase projects, you can find these values in **Project Settings → API**.

## 4. Start the local Supabase stack (optional but recommended)

If you want to develop against a local database/auth/storage setup, use the Supabase CLI:

```bash
# Start containers for Postgres, API, Auth, Storage, etc.
supabase start

# Apply migrations and seed data defined in supabase/migrations and supabase/seed.sql
supabase db reset
```

This project ships with database migrations and seed data in the `supabase/` directory. The `supabase db reset` command ensures the local database reflects the latest schema and seed fixtures.

## 5. Run the development server

With environment variables configured and (optionally) Supabase running, you can start the Next.js dev server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 6. Useful scripts

- `npm run check-all` – Formats, lints, type-checks, and builds the project.
- `npm run test` – Executes the unit test suite with Vitest.
- `npm run test:e2e` – Runs Playwright end-to-end tests (requires the app and Supabase running).
- `npm run seed` – Re-seeds the database using `scripts/seed.ts` (requires valid Supabase credentials).

## Troubleshooting

- Ensure the Supabase containers are running (`supabase status`) before starting the app if you depend on the local stack.
- If the app cannot connect to Supabase, double-check the `.env.local` values and confirm they match the CLI output or hosted project settings.
- Delete the `.next` directory and restart the dev server if you see stale environment values being used.
