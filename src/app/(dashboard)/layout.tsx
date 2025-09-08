import type { Metadata } from 'next';

import { Toaster } from '@/components/ui/sonner';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export const metadata: Metadata = {
  title: 'Dashboard | Dynamic QR',
  description: 'Manage your QR codes and view analytics',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      {children}
      <Toaster />
    </div>
  );
}
