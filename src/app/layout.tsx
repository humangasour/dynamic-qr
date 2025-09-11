import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
// i18n provider now lives in `app/[locale]/layout.tsx`

import { TRPCProvider } from '@infra/trpc/provider';
import { Toaster } from '@/components/ui/sonner';
import { defaultLocale } from '@/i18n/config';
import { TooltipProvider } from '@/components/ui/tooltip';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dynamic QR',
  description: 'Create and manage dynamic QR codes with analytics',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
