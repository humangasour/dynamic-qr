'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, QrCode, BarChart, Settings as SettingsIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { withLocaleHref } from '@/i18n/routing';

interface NavItem {
  href?: string;
  key: 'overview' | 'qrCodes' | 'analytics' | 'settings';
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
}

const items: NavItem[] = [
  { href: '/dashboard', key: 'overview', icon: LayoutDashboard },
  { href: '/qr', key: 'qrCodes', icon: QrCode },
  { href: '/analytics', key: 'analytics', icon: BarChart },
  { href: '/settings', key: 'settings', icon: SettingsIcon },
];

export function SidebarNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');

  const isActive = (href?: string) => {
    if (!href) return false;
    const normalized = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/';
    // Mark as active if exact or prefix match for nested routes
    if (href === '/dashboard') return normalized === '/dashboard';
    return normalized === href || normalized.startsWith(`${href}/`);
  };

  return (
    <NavigationMenu
      viewport={false}
      className="w-full max-w-full justify-start [&>div]:w-full [&>div]:flex-1"
    >
      <NavigationMenuList className="flex w-full flex-col gap-1 p-2">
        {items.map((item) => {
          const { href, key, icon: Icon, soon } = item;
          return (
            <NavigationMenuItem key={key} className="w-full">
              {href && !soon ? (
                <NavigationMenuLink asChild data-active={isActive(href)}>
                  <Link
                    href={withLocaleHref(href, locale)}
                    aria-current={isActive(href) ? 'page' : undefined}
                    className="flex w-full flex-row items-center gap-2 rounded-sm py-2 pl-[calc(theme(spacing.4)-theme(spacing.2))] sm:pl-[calc(theme(spacing.6)-theme(spacing.2))] lg:pl-[calc(theme(spacing.8)-theme(spacing.2))] transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
                  >
                    {Icon && <Icon className="size-4" aria-hidden="true" />}
                    <span>{t(key)}</span>
                  </Link>
                </NavigationMenuLink>
              ) : (
                <div
                  className="flex w-full items-center gap-2 rounded-sm py-2 pl-[calc(theme(spacing.4)-theme(spacing.2))] sm:pl-[calc(theme(spacing.6)-theme(spacing.2))] lg:pl-[calc(theme(spacing.8)-theme(spacing.2))] text-muted-foreground"
                  aria-disabled="true"
                >
                  {Icon && <Icon className="size-4" aria-hidden="true" />}
                  <span>{t(key)}</span>
                  <span className="ml-auto inline-block rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    {t('soon')}
                  </span>
                </div>
              )}
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
