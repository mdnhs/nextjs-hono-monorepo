import { type ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeProvider';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' storageKey='dashboard-theme' enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
