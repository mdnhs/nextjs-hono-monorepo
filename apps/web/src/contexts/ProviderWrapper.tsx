'use client';

import LoadingOverlayProvider from '@/contexts/LoadingOverlayProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { QueryProvider } from '@/contexts/QueryProvider';
import { NuqsProvider } from '@/contexts/NuqsProvider';
import { type ReactNode } from 'react';

export default function ProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
        <NuqsProvider>
          <LoadingOverlayProvider>{children}</LoadingOverlayProvider>
        </NuqsProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
