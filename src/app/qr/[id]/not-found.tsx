import Link from 'next/link';

import { NotFoundError } from '@/components/ui/error-display';
import { Button } from '@/components/ui/button';

export default function QrDetailsNotFound() {
  return (
    <NotFoundError
      message="The QR code you're looking for doesn't exist or may have been deleted."
      actions={
        <>
          <Button asChild>
            <Link href="/app">Back to Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/qr/new">Create New QR Code</Link>
          </Button>
        </>
      }
    />
  );
}
