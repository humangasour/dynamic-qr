'use client';

import { useEffect } from 'react';

import { UnauthorizedError, NotFoundError, GenericError } from '@/components/ui/error-display';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function QrDetailsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('QR Details Error:', error);
  }, [error]);

  const name = (error?.name || '').toUpperCase();
  const msg = error?.message || '';

  // Prefer our centralized UI_* names if present, fallback to message inspection
  const isUnauthorized = name === 'UI_UNAUTHORIZED' || /access denied|unauthorized/i.test(msg);
  const isNotFound = name === 'UI_NOT_FOUND' || /not\s*found/i.test(msg);
  const isInvalidFormat = name === 'UI_BAD_REQUEST' || /invalid.*(id|uuid|format)/i.test(msg);

  if (isUnauthorized) {
    return (
      <UnauthorizedError
        message="You don't have permission to view this QR code. It may belong to a different organization."
        onRetry={reset}
      />
    );
  }

  if (isNotFound) {
    return (
      <NotFoundError
        message="The QR code you're looking for doesn't exist or may have been deleted."
        onRetry={reset}
      />
    );
  }

  if (isInvalidFormat) {
    return (
      <NotFoundError
        message="The QR code ID format is invalid. Please check the URL and try again."
        onRetry={reset}
      />
    );
  }

  return <GenericError error={error} onRetry={reset} />;
}
