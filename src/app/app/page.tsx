import { requireUserIdForServerComponent } from '@/features/auth/server';
import { Toaster } from '@/components/ui/sonner';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default async function DashboardPage() {
  // This will redirect to sign-in if user is not authenticated (server component safe)
  await requireUserIdForServerComponent();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Dynamic QR</h1>
            <p className="text-xl text-gray-600 mb-8">Your QR code management dashboard</p>
            <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
                <p className="text-gray-600 mb-6">
                  We&apos;re working hard to bring you an amazing QR code management experience.
                  Stay tuned for exciting features!
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
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
