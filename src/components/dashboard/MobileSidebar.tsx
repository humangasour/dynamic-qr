'use client';

import { Menu } from 'lucide-react';

import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[var(--sidebar-w)] p-0 pt-[calc(var(--topbar-h)+env(safe-area-inset-top))]"
        aria-label="Mobile navigation"
      >
        <SheetTitle className="sr-only">Mobile navigation</SheetTitle>
        <nav aria-label="Primary" className="min-h-full">
          <SidebarNav />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
