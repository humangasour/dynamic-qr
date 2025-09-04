import React from 'react';
import type { Metadata } from 'next';

import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Dynamic QR Codes - Redirect',
  description: 'QR code redirect service - no slug provided',
};

/**
 * Handle requests to /r/ (root redirect path)
 * This shows a fallback when no slug is provided
 */
export default function RedirectRootPage() {
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
              No redirect slug provided. Please provide a valid QR code slug.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">This could happen if:</p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• The URL is incomplete</li>
              <li>• The QR code link is malformed</li>
              <li>• You&apos;re accessing the redirect service directly</li>
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
