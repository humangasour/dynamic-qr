import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';

import { Container } from '@/components/layout/Container';
import { trpc } from '@infra/trpc/server-client';

interface RedirectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: RedirectPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: 'Dynamic QR Codes - Redirect',
    description: `Redirecting to target URL for QR code: ${slug}`,
  };
}

/**
 * Public redirect page for QR code slugs
 * Handles /r/[slug] requests with 302 redirects and graceful fallback
 */
export default async function RedirectPage({ params }: RedirectPageProps) {
  const { slug } = await params;

  try {
    // Extract visitor metadata from headers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') ?? undefined;
    const referrer = headersList.get('referer') ?? undefined;

    // Note: IP extraction would need to be handled differently in production
    // For now, we'll pass undefined and let the database function handle it
    const ip = undefined;
    const country = undefined; // Could be extracted from Cloudflare headers in production

    // Call tRPC to get the target URL
    const result = await trpc.public.redirect.handle.query({
      slug,
      ip,
      userAgent,
      referrer,
      country,
    });

    // If we have a valid target URL, perform 302 redirect
    if (result.success && result.targetUrl) {
      redirect(result.targetUrl);
    }

    // If no target URL found, show graceful fallback
    return <NotFoundFallback slug={slug} />;
  } catch (error) {
    // Check if this is a Next.js redirect error (which is normal)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // Re-throw redirect errors - they should not be caught
      throw error;
    }

    console.error('Redirect error:', error);
    // On any other error, show graceful fallback
    return <NotFoundFallback slug={slug} />;
  }
}

/**
 * Graceful fallback component for invalid/missing slugs
 */
function NotFoundFallback({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Container>
        <div className="max-w-md w-full bg-card shadow-lg rounded-lg p-8 text-center mx-auto">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Link Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The short link{' '}
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">/r/{slug}</code> could
              not be found or may have been deactivated.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">This could happen if:</p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• The QR code has been deleted</li>
              <li>• The link has been deactivated</li>
              <li>• There was a typo in the URL</li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">Powered by Dynamic QR Codes</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
