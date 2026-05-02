'use client';

import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'sonner';
import LoadingOverlayProvider from '@/contexts/LoadingOverlayProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { QueryProvider } from '@/contexts/QueryProvider';
import { NuqsProvider } from '@/contexts/NuqsProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function ProviderWrapper({ children, locale, messages }: { children: ReactNode; locale: string; messages: Record<string, unknown> }) {
  const pathname = usePathname();
  const isDashboard = pathname.includes('/dashboard') || pathname.includes('/admin') || pathname.includes('/store-admin') || pathname.includes('/account');
  const storageKey = isDashboard ? 'dashboard-theme' : 'landing-theme';

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryProvider>
        <ThemeProvider attribute='class' defaultTheme='light' storageKey={storageKey} enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <NuqsProvider>
              <LoadingOverlayProvider>{children}</LoadingOverlayProvider>
              <Toaster richColors position='top-right' />
            </NuqsProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
