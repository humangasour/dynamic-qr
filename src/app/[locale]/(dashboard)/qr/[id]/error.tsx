'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error('Error in QR details page:', error);
  }, [error]);

  return (
    <div className="py-12 px-page">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">{t('generic.title')}</h1>
        <p className="text-muted-foreground">{t('generic.description')}</p>
      </div>
    </div>
  );
}
