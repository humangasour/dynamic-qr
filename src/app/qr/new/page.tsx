import { requireUserIdForServerComponent } from '@/features/auth/server';
import { Toaster } from '@/components/ui/sonner';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { CreateQrForm } from '@/components/qr/CreateQrForm';

export default async function CreateQrPage() {
  // This will redirect to sign-in if user is not authenticated (server component safe)
  await requireUserIdForServerComponent();

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
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
      <Toaster />
    </div>
  );
}
