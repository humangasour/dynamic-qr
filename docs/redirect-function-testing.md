# Testing the Redirect Function

This document explains how to test the newly created `handle_redirect` database function.

## Overview

The `handle_redirect` function is a database function that:

- Takes a slug parameter and request metadata (IP, user agent, referrer, country)
- Looks up active QR codes by slug
- Logs visits to the `scan_events` table with comprehensive metadata
- Returns the target URL for valid slugs

## Prerequisites

1. **Supabase CLI installed** and configured
2. **Database running** (local or remote)
3. **Migrations applied** including the new `handle_redirect` function

## Setup Steps

### 1. Apply Database Migrations

```bash
# If running locally
supabase db reset

# If running on remote
supabase db push
```

### 2. Seed Test Data

Run the TypeScript seed script:

```bash
npm run seed
```

This will create:

- Test organization: "Demo Org"
- Test user: demo@qr.local / demo-password
- Test QR codes:
  - `hello` → https://example.com
  - `test-qr-1` → https://example.com/test1
  - `test-qr-2` → https://example.com/test2
  - `archived-qr` → https://example.com/archived (archived status)

### 3. Access Test Page

Navigate to `/test-redirect` in your application to access the test interface.

## Testing the Function

### Manual Testing via Test Page

1. **Check Function Status**: Verify the function exists and is accessible
2. **Test Valid Slugs**: Try `test-qr-1` or `test-qr-2`
3. **Test Invalid Slugs**: Try non-existent slugs like `invalid-slug`
4. **Test Archived QR**: Try `archived-qr` (should return empty result)

### Expected Results

#### Valid Active Slug (`hello`)

```json
[
  {
    "target_url": "https://example.com"
  }
]
```

#### Invalid Slug (`invalid-slug`)

```json
[]
```

#### Archived Slug (`archived-qr`)

```json
[]
```

## Database Verification

### Check Visit Logging

After testing valid slugs, verify visits are logged:

```sql
SELECT * FROM public.scan_events ORDER BY ts DESC LIMIT 5;
```

### Check Function Definition

```sql
SELECT
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'handle_redirect';
```

## Troubleshooting

### Function Not Found

If you get "function does not exist" errors:

1. **Check migrations**: Ensure `20241201000003_create_redirect_function.sql` was applied
2. **Reset database**: Run `supabase db reset` to apply all migrations
3. **Check permissions**: Verify the function has proper execute permissions

### Permission Errors

If you get permission errors:

1. **Check RLS**: Ensure the function has `SECURITY DEFINER`
2. **Check grants**: Verify `anon` and `authenticated` roles can execute
3. **Check table access**: Ensure the function can access `qr_codes` and `scan_events`

### Performance Issues

If redirects are slow:

1. **Check indexes**: Verify `idx_qr_codes_slug_active` exists
2. **Check query plan**: Use `EXPLAIN ANALYZE` on the function
3. **Monitor logs**: Check for any database bottlenecks

## Next Steps

Once the function is working correctly:

1. **Create the API route** at `/api/r/[slug]`
2. **Implement visit logging** with proper IP/user-agent extraction
3. **Add error handling** for edge cases
4. **Create comprehensive tests** for the entire redirect flow

## Security Notes

- The function uses `SECURITY DEFINER` to bypass RLS for public access
- Only active QR codes are accessible
- Visit logging is fire-and-forget (doesn't block redirects)
- Input validation should be added at the API layer
