'use client';

import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'sonner';
import LoadingOverlayProvider from '@/contexts/LoadingOverlayProvider';
import { QueryProvider } from '@/contexts/QueryProvider';
import { NuqsProvider } from '@/contexts/NuqsProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { type ReactNode } from 'react';

export default function ProviderWrapper({ children, locale, messages }: { children: ReactNode; locale: string; messages: Record<string, unknown> }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryProvider>
        <TooltipProvider>
          <NuqsProvider>
            <LoadingOverlayProvider>{children}</LoadingOverlayProvider>
            <Toaster richColors position='top-right' />
          </NuqsProvider>
        </TooltipProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
