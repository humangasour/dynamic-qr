import type { Metadata } from 'next';

import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Authentication | Dynamic QR',
  description: 'Sign in or create an account to access Dynamic QR features',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Container className="py-12">
        <div className="max-w-md w-full space-y-8 mx-auto">
          <header className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Dynamic QR</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage your QR codes with ease</p>
          </header>
          {children}
        </div>
      </Container>
    </div>
  );
}
