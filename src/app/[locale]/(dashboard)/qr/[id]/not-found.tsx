import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <div className="py-12 px-page">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">{t('qr.details.page.notFoundTitle')}</h1>
        <p className="text-muted-foreground mb-8">{t('qr.details.page.notFoundDescription')}</p>
        <div className="flex justify-center gap-2">
          <Link href={`/${locale}/dashboard`} className="underline">
            {t('qr.details.page.backToDashboard')}
          </Link>
          <Link href={`/${locale}/qr/new`} className="underline">
            {t('qr.page.index.createCta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
