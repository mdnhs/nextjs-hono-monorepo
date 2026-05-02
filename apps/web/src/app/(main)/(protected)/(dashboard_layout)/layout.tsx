import { type ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-screen'>
      {/* TODO: Add sidebar here */}
      <main className='flex-1 p-6'>{children}</main>
    </div>
  );
}
