// Browser client (for client components)
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@shared/types';

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'public' },
      auth: {
        // Enable automatic token refresh
        autoRefreshToken: true,
        // Persist session across browser sessions
        persistSession: true,
        // Detect session in URL (for OAuth flows)
        detectSessionInUrl: true,
      },
      cookies: {
        // Get cookies from document.cookie
        getAll() {
          return document.cookie
            .split(';')
            .map((cookie) => cookie.trim().split('='))
            .filter(([name]) => name)
            .map(([name, value]) => ({ name, value }));
        },
        // Set cookies with proper options
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${value}`;

            if (options?.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`;
            }
            if (options?.expires) {
              cookieString += `; Expires=${options.expires.toUTCString()}`;
            }
            if (options?.domain) {
              cookieString += `; Domain=${options.domain}`;
            }
            // Ensure cookies are available app-wide by default
            cookieString += `; Path=${options?.path ?? '/'}`;
            if (options?.secure) {
              cookieString += `; Secure`;
            }
            if (options?.httpOnly) {
              cookieString += `; HttpOnly`;
            }
            if (options?.sameSite) {
              cookieString += `; SameSite=${options.sameSite}`;
            }

            document.cookie = cookieString;
          });
        },
      },
    },
  );

  return browserClient;
}
