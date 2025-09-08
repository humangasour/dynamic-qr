'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, QrCode, BarChart, Settings as SettingsIcon } from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

type NavItem = {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
};

const items: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/qr', label: 'QR Codes', icon: QrCode },
  { href: '/analytics', label: 'Analytics', icon: BarChart, soon: true },
  { href: '/settings', label: 'Settings', icon: SettingsIcon, soon: true },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href?: string) => {
    if (!href) return false;
    // Mark as active if exact or prefix match for nested routes
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <NavigationMenu
      viewport={false}
      className="w-full max-w-full justify-start [&>div]:w-full [&>div]:flex-1"
    >
      <NavigationMenuList className="flex w-full flex-col gap-1 p-2">
        {items.map(({ href, label, icon: Icon, soon }) => (
          <NavigationMenuItem key={label} className="w-full">
            {href && !soon ? (
              <NavigationMenuLink asChild data-active={isActive(href)}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className="flex w-full flex-row items-center gap-2 rounded-sm py-2 pl-[calc(theme(spacing.4)-theme(spacing.2))] sm:pl-[calc(theme(spacing.6)-theme(spacing.2))] lg:pl-[calc(theme(spacing.8)-theme(spacing.2))] transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </NavigationMenuLink>
            ) : (
              <div
                className="flex w-full items-center gap-2 rounded-sm py-2 pl-[calc(theme(spacing.4)-theme(spacing.2))] sm:pl-[calc(theme(spacing.6)-theme(spacing.2))] lg:pl-[calc(theme(spacing.8)-theme(spacing.2))] text-muted-foreground"
                aria-disabled="true"
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{label}</span>
                <span className="ml-auto inline-block rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                  Soon
                </span>
              </div>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
