import en from '../../src/i18n/messages/en.json';

type Messages = typeof en;

export function getMsg(path: string, values?: Record<string, unknown>): string {
  const parts = path.split('.');
  let cur: unknown = en as Messages;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      cur = undefined;
      break;
    }
  }
  let msg = typeof cur === 'string' ? cur : path;
  if (values && typeof msg === 'string') {
    for (const [k, v] of Object.entries(values)) {
      msg = msg.replace(new RegExp(String.raw`\{${k}\}`, 'g'), String(v));
    }
  }
  return msg;
}

// Factory returning a next-intl mock consistent across tests
export function createNextIntlMock() {
  return {
    useTranslations: (ns?: string) => (key: string, values?: Record<string, unknown>) =>
      getMsg(ns ? `${ns}.${key}` : key, values),
    useLocale: () => 'en',
  };
}
