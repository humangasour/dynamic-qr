# tRPC Setup Documentation

## Overview

This document describes the tRPC setup for the Dynamic QR project, providing end-to-end type safety for API calls.

## Architecture

### Core Components

1. **tRPC Server** (`src/lib/trpc/trpc.ts`)
   - Initializes tRPC with context
   - Provides public procedures
   - Handles error formatting

2. **Schemas** (`src/lib/trpc/schemas/`)
   - `redirect.ts` - Input/output validation schemas for redirect procedures
   - Centralized validation logic with Zod
   - Type-safe schema definitions

3. **Routers** (`src/lib/trpc/routers/`)
   - `public.ts` - Main public router (no authentication required)
   - `redirect.ts` - Redirect-specific procedures
   - Organized by feature/domain for scalability

4. **API Route** (`src/app/api/trpc/[trpc]/route.ts`)
   - Next.js App Router API handler
   - Handles both GET and POST requests
   - Provides development error logging

5. **Client Setup** (`src/lib/trpc/client.ts`, `src/lib/trpc/provider.tsx`)
   - React Query integration
   - Client-side tRPC client
   - Provider component for app-wide usage

## Usage

### Server-Side (API Routes, Server Components)

```typescript
import { trpc } from '@/lib/trpc/server-client';

// In an API route or server component
const result = await trpc.public.redirect.handle.query({
  slug: 'my-qr-code',
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0...',
  referrer: 'https://example.com',
  country: 'US',
});
```

### Client-Side (React Components)

```typescript
import { api } from '@/lib/trpc/client';

function MyComponent() {
  const redirectQuery = api.public.redirect.handle.useQuery({
    slug: 'my-qr-code',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0...',
    referrer: 'https://example.com',
    country: 'US',
  });

  if (redirectQuery.isLoading) return <div>Loading...</div>;
  if (redirectQuery.error) return <div>Error: {redirectQuery.error.message}</div>;

  return <div>Target URL: {redirectQuery.data?.targetUrl}</div>;
}
```

## API Endpoints

### Public Router

#### `public.redirect.handle`

**Input:**

```typescript
{
  slug: string;           // Required: QR code slug
  ip?: string;           // Optional: Client IP address
  userAgent?: string;    // Optional: User agent string
  referrer?: string;     // Optional: Referrer URL
  country?: string;      // Optional: Country code
}
```

**Output:**

```typescript
{
  success: true;
  targetUrl: string | null; // Target URL or null if not found
  slug: string; // The slug that was queried
}
```

## Testing

### Unit Tests

- Router procedures are tested in isolation
- Mock Supabase client for predictable behavior
- Test input validation, error handling, and success cases

### Integration Tests

- Verify API route handlers are properly exported
- Test tRPC context creation
- Ensure router structure is correct

## Scalable Architecture

The tRPC setup is designed for scalability with a clear separation of concerns:

### Directory Structure

```
src/lib/trpc/
├── schemas/           # Validation schemas
│   ├── redirect.ts   # Redirect-specific schemas
│   └── index.ts      # Schema exports
├── routers/          # Feature-based routers
│   ├── public.ts     # Main public router
│   ├── redirect.ts   # Redirect sub-router
│   └── index.ts      # Router exports
├── trpc.ts          # Core tRPC configuration
├── root.ts          # App router definition
└── client.ts        # Client setup
```

### Adding New Features

To add a new feature (e.g., analytics):

1. **Create schemas** (`src/lib/trpc/schemas/analytics.ts`):

```typescript
export const analyticsInputSchema = z.object({
  // ... validation rules
});
```

2. **Create router** (`src/lib/trpc/routers/analytics.ts`):

```typescript
export const analyticsRouter = createTRPCRouter({
  getStats: publicProcedure.input(analyticsInputSchema).query(async ({ input, ctx }) => {
    // ... implementation
  }),
});
```

3. **Add to public router** (`src/lib/trpc/routers/public.ts`):

```typescript
export const publicRouter = createTRPCRouter({
  redirect: redirectRouter,
  analytics: analyticsRouter, // New feature
});
```

4. **Update exports** in respective `index.ts` files

## Benefits

1. **Type Safety**: End-to-end TypeScript types from database to frontend
2. **Developer Experience**: Auto-completion and type checking
3. **Error Handling**: Consistent error formatting and handling
4. **Performance**: Optimized with React Query for caching and background updates
5. **Scalability**: Easy to add new procedures and routers with clear organization
6. **Maintainability**: Feature-based organization makes code easier to find and maintain

## Future Enhancements

1. **Authentication**: Add protected procedures for authenticated users
2. **Rate Limiting**: Implement rate limiting for public procedures
3. **Caching**: Add Redis caching for frequently accessed data
4. **Monitoring**: Add logging and monitoring for API calls
5. **Validation**: Enhanced input validation with custom schemas
