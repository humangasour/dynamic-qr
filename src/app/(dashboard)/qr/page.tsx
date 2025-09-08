import type { Metadata } from 'next';
import Link from 'next/link';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'QR Codes | Dynamic QR',
  description: 'Browse and manage your QR codes',
};

export default async function QrIndexPage() {
  await requireUserIdForServerComponent();

  return (
    <main className="py-6 px-page">
      <div className="py-6 text-center max-w-2xl mx-auto">
        <Heading as="h1" size="h1" className="mb-4">
          Your QR Codes
        </Heading>
        <Text tone="muted" className="mb-6">
          Create and manage dynamic QR codes that redirect to your URLs.
        </Text>
        <Button asChild size="lg">
          <Link href="/qr/new">Create New QR Code</Link>
        </Button>
      </div>
    </main>
  );
}
