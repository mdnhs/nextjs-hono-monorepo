import { type ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className='min-h-screen bg-background text-foreground antialiased'
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {children}
    </div>
  );
}
