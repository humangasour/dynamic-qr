import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import type { Locale } from '@/i18n/config';
import { ZodI18nProvider } from '@/components/providers/ZodI18nProvider';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      locale={locale as Locale}
      messages={messages}
      timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
    >
      <ZodI18nProvider>{children}</ZodI18nProvider>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  // Allow Next to statically discover locale paths at build time if desired.
  // Using runtime config locales is not possible here without an import cycle,
  // so we leave this out. Pages remain dynamic unless an explicit SSG strategy is added.
  return [];
}
