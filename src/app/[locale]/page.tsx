import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

import { getUserIdForServerComponent } from '@/features/auth/server';

export default async function LocaleHome() {
  const userId = await getUserIdForServerComponent();
  const locale = await getLocale();

  if (userId) {
    redirect(`/${locale}/dashboard`);
  } else {
    redirect(`/${locale}/sign-in`);
  }
}
