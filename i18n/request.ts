import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isSupportedLocale } from '../src/i18n/config';

// Pathname-based locale resolution using next-intl's requestLocale
export default getRequestConfig(async ({ requestLocale }) => {
  const active = (await requestLocale) ?? defaultLocale;
  const locale = isSupportedLocale(active) ? active : defaultLocale;
  const messages = (await import(`../src/i18n/messages/${locale}.json`)).default;
  return { locale, messages };
});
