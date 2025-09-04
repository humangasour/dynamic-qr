// src/lib/supabase/server-client.ts
// Next App Router (server components, server actions, route handlers)

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@shared/types';

/**
 * Get Supabase server client for Server Actions and Route Handlers
 * This client can read and write cookies
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options }),
          );
        },
      },
    },
  );
}

/**
 * Get Supabase server client for Server Components (read-only)
 * This client can only read cookies, not write them
 */
export async function getSupabaseServerClientReadOnly(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Allow reading existing sessions but don't auto-refresh
        autoRefreshToken: false,
        persistSession: true,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op for server components - they can't set cookies
        },
      },
    },
  );
}
