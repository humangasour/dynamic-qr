import { useLocale } from 'next-intl';

function isAbsoluteOrProtocol(href: string) {
  return /^(?:[a-z]+:)?\/\//i.test(href) || /^(mailto:|tel:)/i.test(href);
}

function ensureLeadingSlash(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

export function withLocaleHref(path: string, locale: string) {
  if (!path) return `/${locale}`;
  if (isAbsoluteOrProtocol(path)) return path;
  const p = ensureLeadingSlash(path);
  const alreadyPrefixed = new RegExp(`^\/${locale}(?=\/|$)`).test(p);
  return alreadyPrefixed ? p : `/${locale}${p}`;
}

export function useLocaleHref(path: string) {
  const locale = useLocale();
  return withLocaleHref(path, locale);
}
