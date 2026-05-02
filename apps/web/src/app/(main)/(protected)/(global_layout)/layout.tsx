import { type ReactNode } from 'react';

export default function GlobalLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col'>
      {/* TODO: Add global header here */}
      <main className='flex-1'>{children}</main>
      {/* TODO: Add global footer here */}
    </div>
  );
}
