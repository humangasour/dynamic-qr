import type { Metadata } from 'next';
import Link from 'next/link';

import { Toaster } from '@/components/ui/sonner';
import { requireCurrentUserForServerComponent } from '@/features/auth/server';
import { AccountMenu } from '@/components/dashboard/AccountMenu';

export const metadata: Metadata = {
  title: 'Dashboard | Dynamic QR',
  description: 'Manage your QR codes and view analytics',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUserForServerComponent();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip to content for accessibility */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-page h-[var(--topbar-h)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-semibold text-base">
              Dynamic QR
            </Link>
            <div className="hidden md:block text-muted-foreground text-sm" aria-hidden="true">
              {user.org_name}
            </div>
          </div>
          <AccountMenu
            user={{
              name: user.name ?? undefined,
              email: user.email ?? undefined,
              avatarUrl: user.avatar_url ?? undefined,
            }}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[var(--sidebar-w)_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:block border-r border-border min-h-[calc(100vh-var(--topbar-h))]">
          <nav className="px-4 py-4 space-y-2">
            <Link
              href="/dashboard"
              className="block rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Overview
            </Link>
            <Link
              href="/qr"
              className="block rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              QR Codes
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main id="content" className="min-h-[calc(100vh-var(--topbar-h))]">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
