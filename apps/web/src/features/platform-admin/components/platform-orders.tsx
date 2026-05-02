'use client';

import { usePlatformOrders } from '../hooks/api/query/use-orders';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from './ui/page-header';
import { FilterTabs } from './ui/filter-tabs';
import { StatusBadge } from './ui/status-badge';
import { InitialAvatar } from './ui/initial-avatar';

function TableSkeleton() {
  return (
    <Card>
      <div className="divide-y">
        <div className="flex gap-4 bg-muted/50 px-4 py-3">
          {[80, 140, 140, 80, 80, 100].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-3 w-20 font-mono" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const PlatformOrders = ({ status }: { status?: string }) => {
  const router = useRouter();
  const params = status ? { status } : undefined;
  const { data, isLoading, error, refetch } = usePlatformOrders(params);

  const orders = (data?.data as any[]) || [];

  const handleTabChange = (val: string) => {
    if (val === 'all') router.push('/admin/orders');
    else router.push(`/admin/orders?status=${val}`);
  };

  if (isLoading) return <TableSkeleton />;

  if (error || data?.error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">{data?.message ?? 'Failed to load orders'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Orders"
        description={`${orders.length} order${orders.length !== 1 ? 's' : ''}${status ? ` · ${status}` : ''}`}
      />

      <FilterTabs tabs={STATUS_TABS} value={status || 'all'} onChange={handleTabChange} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {['Order #', 'Store', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center gap-2 py-16">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">{order.orderNumber}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.store?.name && <InitialAvatar name={order.store.name} />}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{order.store?.name ?? '—'}</p>
                          <p className="font-mono text-xs text-muted-foreground">{order.store?.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} dot />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
