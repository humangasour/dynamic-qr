import { redirect } from 'next/navigation';

import { defaultLocale } from '@/i18n/config';

export default async function Home() {
  // Redirect root to default-locale prefix; next-intl middleware can also handle this
  redirect(`/${defaultLocale}`);
}
