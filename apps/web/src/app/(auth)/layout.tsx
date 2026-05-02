import { type ReactNode } from 'react';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import { LandingFooter } from '@/components/layout/landing-footer';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className='min-h-screen bg-[#F8F8F6] dark:bg-[#0A0A0A] text-foreground'
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <LandingNavbar />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}
