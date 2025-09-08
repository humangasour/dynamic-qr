import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/shared/types';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client tied to this request/response for cookie-based auth
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Attempt to read the authenticated user (also refreshes session cookies if needed)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // If visiting root and already authenticated, send to dashboard
  if (pathname === '/') {
    if (user) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return res;
  }

  // For all matched dashboard routes, require authentication
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return res;
}

// Run on these routes and the root path
export const config = {
  matcher: ['/', '/dashboard/:path*', '/qr/:path*', '/settings/:path*', '/analytics/:path*'],
};

// Use Node.js runtime to avoid Edge Runtime compatibility issues with Supabase
export const runtime = 'nodejs';
