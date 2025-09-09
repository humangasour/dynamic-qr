export const locales = ['en', 'es'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export function isSupportedLocale(input: string | undefined | null): input is Locale {
  return !!input && (locales as readonly string[]).includes(input);
}

export type Messages = typeof import('./messages/en.json');

// Helper to load messages JSON for a locale
export async function loadMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case 'en':
      return (await import('@/i18n/messages/en.json')).default as Messages;
    case 'es':
      return (await import('@/i18n/messages/es.json')).default as Messages;
    default:
      return (await import('@/i18n/messages/en.json')).default as Messages;
  }
}
