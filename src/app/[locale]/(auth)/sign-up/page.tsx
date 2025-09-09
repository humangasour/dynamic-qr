import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { redirectIfAuthenticatedForServerComponent } from '@/features/auth/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.page.signUp');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function SignUpPage() {
  await redirectIfAuthenticatedForServerComponent();
  const t = await getTranslations();
  return (
    <main role="main" aria-labelledby="signup-heading">
      <Card>
        <CardHeader className="space-y-1">
          <h2 id="signup-heading" className="text-2xl font-semibold">
            {t('auth.page.signUp.title')}
          </h2>
          <CardDescription>{t('auth.page.signUp.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </main>
  );
}
