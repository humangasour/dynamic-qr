'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

import { withLocaleHref } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { auth } from '@/infrastructure/supabase/utils';

export function DashboardNav() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const { error } = await auth.signOut();

      if (error) {
        toast.error(t('dashboard.nav.signOutError'));
        return;
      }

      toast.success(t('dashboard.nav.signOutSuccess'));
      router.replace(withLocaleHref('/sign-in', locale));
    } catch (error) {
      toast.error(t('dashboard.nav.unexpectedError'));
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav
      className="bg-background shadow-sm border-b border-border"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="px-page">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-foreground">{t('app.title')}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-label={t('dashboard.nav.signOut')}
            >
              {isSigningOut ? t('dashboard.nav.signingOut') : t('dashboard.nav.signOut')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
