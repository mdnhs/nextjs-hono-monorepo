import type { Metadata } from 'next';
import '../styles/globals.css';
import { dmSans, spaceGroteskHeading } from '@/lib/font';
import { cn } from '@/lib/utils';
import ProviderWrapper from '@/contexts/ProviderWrapper';

import { type ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Ecommerce Store',
  description: 'A modern ecommerce store built with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning className={cn('font-sans', dmSans.variable, spaceGroteskHeading.variable)}>
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
