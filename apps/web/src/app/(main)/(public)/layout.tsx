import { type ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeProvider';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' storageKey='landing-theme' enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
