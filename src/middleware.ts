import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';

import { locales, defaultLocale, isSupportedLocale } from '@/i18n/config';
import type { Database } from '@/shared/types';

const intlMiddleware = createIntlMiddleware({
  locales: [...locales],
  defaultLocale,
});

export async function middleware(req: NextRequest) {
  // Run next-intl middleware first to resolve locale and apply locale prefixes
  let res = intlMiddleware(req);
  if (!res) res = NextResponse.next();

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

  const pathname = req.nextUrl.pathname || '/';
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const locale = isSupportedLocale(maybeLocale) ? maybeLocale : defaultLocale;
  const pathWithoutLocale = isSupportedLocale(maybeLocale)
    ? `/${segments.slice(1).join('/')}`
    : pathname;

  // If visiting root and already authenticated, send to dashboard (locale-aware)
  if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
    if (user) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/dashboard`;
      return NextResponse.redirect(url);
    }
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    return NextResponse.redirect(url);
  }

  // Protected route prefixes
  const protectedPrefixes = ['/dashboard', '/qr', '/settings', '/analytics'];
  const isProtected = protectedPrefixes.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`),
  );

  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return res;
}

// Run on all non-static routes so locale detection always applies
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};

// Use Node.js runtime to avoid Edge Runtime compatibility issues with Supabase
export const runtime = 'nodejs';
