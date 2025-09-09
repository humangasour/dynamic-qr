'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { useTranslations } from 'next-intl';

import { buildZodErrorMap } from '@/i18n/zod';

export function ZodI18nProvider({ children }: { children: React.ReactNode }) {
  const tv = useTranslations();

  useEffect(() => {
    const translate: (k: string, v?: Record<string, unknown>) => string = (k, v) =>
      (tv as unknown as (k: string, v?: Record<string, unknown>) => string)(k, v);
    const map = buildZodErrorMap(translate);
    z.config({
      customError: (iss) =>
        map(iss as unknown as Parameters<typeof map>[0], { defaultError: 'Invalid input' }).message,
    });
  }, [tv]);

  return <>{children}</>;
}
