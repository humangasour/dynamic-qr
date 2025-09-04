import { requireUserIdForServerComponent } from '@/features/auth/server';
import { Toaster } from '@/components/ui/sonner';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default async function DashboardPage() {
  // This will redirect to sign-in if user is not authenticated (server component safe)
  await requireUserIdForServerComponent();

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="py-6 px-page">
        <div className="py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to Dynamic QR</h1>
            <p className="text-xl text-muted-foreground mb-8">Your QR code management dashboard</p>
            <div className="bg-card rounded-lg shadow p-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Coming Soon</h2>
                <p className="text-muted-foreground mb-6">
                  We&apos;re working hard to bring you an amazing QR code management experience.
                  Stay tuned for exciting features!
                </p>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-primary text-sm">
                    <strong>What&apos;s coming:</strong> QR code generation, analytics, custom
                    branding, and much more!
                  </p>
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
