import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/layout/Container';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.layout');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Container className="py-12">
        <div className="max-w-md w-full space-y-8 mx-auto">
          <header className="text-center">
            <Heading as="h1" size="h1">
              {t('app.title')}
            </Heading>
            <Text size="sm" tone="muted" className="mt-2">
              {t('app.tagline')}
            </Text>
          </header>
          {children}
        </div>
      </Container>
    </div>
  );
}
