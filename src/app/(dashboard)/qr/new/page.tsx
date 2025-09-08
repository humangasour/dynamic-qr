import type { Metadata } from 'next';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { CreateQrForm } from '@/components/qr/CreateQrForm';

export const metadata: Metadata = {
  title: 'Create QR | Dynamic QR',
  description: 'Generate a new dynamic QR code',
};

export default async function CreateQrPage() {
  // This will redirect to sign-in if user is not authenticated (server component safe)
  await requireUserIdForServerComponent();

  return (
    <main className="py-6 px-page">
      <div className="py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Heading as="h1" size="h1" className="mb-4">
              Create New QR Code
            </Heading>
            <Text size="lead" tone="muted">
              Generate a dynamic QR code that redirects to your target URL
            </Text>
          </div>
          <CreateQrForm />
        </div>
      </div>
    </main>
  );
}
