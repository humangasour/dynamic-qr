import { requireUserIdForServerComponent } from '@/features/auth/server';
import { Toaster } from '@/components/ui/sonner';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';

export default async function DashboardPage() {
  // This will redirect to sign-in if user is not authenticated (server component safe)
  await requireUserIdForServerComponent();

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="py-6 px-page">
        <div className="py-6">
          <div className="text-center">
            <Heading as="h1" size="h1" className="mb-4">
              Welcome to Dynamic QR
            </Heading>
            <Text size="lead" tone="muted" className="mb-8">
              Your QR code management dashboard
            </Text>
            <div className="bg-card rounded-lg shadow p-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-6xl mb-4">🚧</div>
                <Heading as="h2" size="h3" className="mb-4">
                  Coming Soon
                </Heading>
                <Text tone="muted" className="mb-6">
                  We&apos;re working hard to bring you an amazing QR code management experience.
                  Stay tuned for exciting features!
                </Text>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <Text as="p" size="sm" className="text-primary">
                    <strong>What&apos;s coming:</strong> QR code generation, analytics, custom
                    branding, and much more!
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
