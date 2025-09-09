import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { SignInForm } from '@/components/auth/SignInForm';
import { redirectIfAuthenticatedForServerComponent } from '@/features/auth/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.page.signIn');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function SignInPage() {
  await redirectIfAuthenticatedForServerComponent();
  const t = await getTranslations();
  return (
    <main role="main" aria-labelledby="signin-heading">
      <Card>
        <CardHeader className="space-y-1">
          <h2 id="signin-heading" className="text-2xl font-semibold">
            {t('auth.page.signIn.title')}
          </h2>
          <CardDescription>{t('auth.page.signIn.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </main>
  );
}
