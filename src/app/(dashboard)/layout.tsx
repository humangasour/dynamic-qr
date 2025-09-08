import type { Metadata } from 'next';
import Link from 'next/link';

import { requireCurrentUserForServerComponent } from '@/features/auth/server';
import { AccountMenu } from '@/components/dashboard/AccountMenu';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { UserOrgProvider } from '@/features/auth/UserOrgProvider';

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
        <div className="px-page h-[calc(var(--topbar-h)-1px)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger on small screens */}
            <MobileSidebar />
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

      <UserOrgProvider
        value={{
          userId: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
          orgId: user.org_id,
          orgName: user.org_name,
          orgRole: user.org_role,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[var(--sidebar-w)_1fr]">
          {/* Sidebar */}
          <aside
            className="hidden md:block border-r border-border min-h-[calc(100vh-var(--topbar-h))]"
            aria-label="Primary"
          >
            <SidebarNav />
          </aside>

          {/* Main content */}
          <main id="content" className="min-h-[calc(100vh-var(--topbar-h))]">
            {children}
          </main>
        </div>
      </UserOrgProvider>

      {/* Global Toaster now mounted in root layout */}
    </div>
  );
}
