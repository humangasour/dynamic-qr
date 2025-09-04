import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Dynamic QR',
  description: 'Sign in or create an account to access Dynamic QR features',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Dynamic QR</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your QR codes with ease</p>
        </header>
        {children}
      </div>
    </div>
  );
}
