'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Platform Admin',
  stores: 'Stores',
  users: 'Users',
  plans: 'Plans',
  billing: 'Billing',
  subscriptions: 'Subscriptions',
  analytics: 'Analytics',
  orders: 'Orders',
  settings: 'Settings',
  create: 'Create',
  roles: 'Roles',
  invoices: 'Invoices',
  transactions: 'Transactions',
};

export function AdminBreadcrumb() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const adminIdx = segments.indexOf('admin');
  const relevant = adminIdx >= 0 ? segments.slice(adminIdx) : segments;

  if (relevant.length <= 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-medium">Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Platform
          </BreadcrumbLink>
        </BreadcrumbItem>
        {relevant.slice(1).map((seg, i, arr) => {
          const href = '/admin/' + relevant.slice(1, i + 2).join('/');
          const label = SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
          const isLast = i === arr.length - 1;
          return (
            <span key={seg} className="flex items-center gap-1.5">
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-sm font-medium">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href} className="text-sm text-muted-foreground hover:text-foreground">
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
