import type { Metadata } from 'next';
import Link from 'next/link';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Dashboard | Dynamic QR',
  description: 'Your QR code management dashboard',
};

export default async function DashboardPage() {
  // This will redirect to sign-in if user is not authenticated (server component safe)
  await requireUserIdForServerComponent();

  return (
    <main className="py-6 px-page">
      <div className="py-6">
        <div className="text-center">
          <Heading as="h1" size="h1" className="mb-4">
            Welcome to Dynamic QR
          </Heading>
          <Text size="lead" tone="muted" className="mb-8">
            Your QR code management dashboard
          </Text>
          <div className="mb-8">
            <Button asChild size="lg">
              <Link href="/qr/new">Create New QR Code</Link>
            </Button>
          </div>
          {/* Removed the temporary Coming Soon box */}
        </div>
      </div>
    </main>
  );
}
