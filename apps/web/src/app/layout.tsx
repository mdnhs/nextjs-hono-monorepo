import type { Metadata } from 'next';
import '../styles/globals.css';
import { getLocale, getMessages } from 'next-intl/server';
import { dmSans, spaceGroteskHeading } from '@/lib/font';
import { cn } from '@/lib/utils';
import ProviderWrapper from '@/contexts/ProviderWrapper';

import { type ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Ecommerce Store',
  description: 'A modern ecommerce store built with Next.js',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={cn('font-sans', dmSans.variable, spaceGroteskHeading.variable)}>
      <body suppressHydrationWarning>
        <ProviderWrapper locale={locale} messages={messages}>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
