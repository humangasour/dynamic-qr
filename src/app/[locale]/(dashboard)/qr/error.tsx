'use client';

import * as React from 'react';

import { GenericError } from '@/components/ui/error-display';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return <GenericError error={error} onRetry={reset} />;
}
