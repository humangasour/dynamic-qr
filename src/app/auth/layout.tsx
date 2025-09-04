import type { Metadata } from 'next';

import { Container } from '@/components/layout/Container';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';

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
            <Heading as="h1" size="h1">
              Dynamic QR
            </Heading>
            <Text size="sm" tone="muted" className="mt-2">
              Manage your QR codes with ease
            </Text>
          </header>
          {children}
        </div>
      </Container>
    </div>
  );
}
