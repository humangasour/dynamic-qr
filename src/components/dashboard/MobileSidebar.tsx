'use client';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export function MobileSidebar() {
  const t = useTranslations('common.nav');
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('openMenu')}>
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[var(--sidebar-w)] p-0 pt-[calc(var(--topbar-h)+env(safe-area-inset-top))]"
        aria-label={t('mobileNavigation')}
      >
        <SheetTitle className="sr-only">{t('mobileNavigation')}</SheetTitle>
        <nav aria-label={t('primaryAria')} className="min-h-full">
          <SidebarNav />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
