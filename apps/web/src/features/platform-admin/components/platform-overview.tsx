'use client';

import Link from 'next/link';
import { usePlatformDashboard } from '../hooks/api/query/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Store, Users, Package, ShoppingCart, DollarSign,
  Clock, CheckCircle, RefreshCw, ArrowRight, AlertCircle,
} from 'lucide-react';
import { PageHeader } from './ui/page-header';

/* ─── Skeleton ─────────────────────────────────────────────────────────── */
function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-14" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-7 w-10" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Stat card ─────────────────────────────────────────────────────────── */
interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  href?: string;
  borderColor: string;
  iconBg: string;
}

function StatCard({ title, value, sub, icon: Icon, href, borderColor, iconBg }: StatCardProps) {
  return (
    <Card className={`relative overflow-hidden border-l-[3px] ${borderColor}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {href && (
          <Link
            href={href}
            className="mt-3 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
export const PlatformOverview = () => {
  const { data, isLoading, error, refetch } = usePlatformDashboard();

  if (isLoading) return <OverviewSkeleton />;

  if (error || data?.error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">{data?.message ?? 'Failed to load dashboard'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  const d = data?.data;
  const pendingCount = d?.stores.pending ?? 0;
  const totalStores = d?.stores.total ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        description="Monitor stores, users, orders, and revenue across the platform."
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Total Stores"
          value={d?.stores.total ?? 0}
          sub={`${d?.stores.approved ?? 0} approved`}
          icon={Store}
          href="/admin/stores"
          borderColor="border-l-blue-500"
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          sub={pendingCount > 0 ? 'Needs attention' : 'All clear'}
          icon={Clock}
          href="/admin/stores?status=pending"
          borderColor={pendingCount > 0 ? 'border-l-amber-500' : 'border-l-emerald-500'}
          iconBg={pendingCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}
        />
        <StatCard
          title="Total Users"
          value={d?.users.total ?? 0}
          sub={`${d?.users.sellers ?? 0} sellers`}
          icon={Users}
          href="/admin/users"
          borderColor="border-l-violet-500"
          iconBg="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="Revenue"
          value={`$${(d?.revenue ?? 0).toLocaleString()}`}
          sub="All time"
          icon={DollarSign}
          borderColor="border-l-emerald-500"
          iconBg="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          title="Products"
          value={d?.products ?? 0}
          icon={Package}
          borderColor="border-l-orange-500"
          iconBg="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Total Orders"
          value={d?.orders ?? 0}
          icon={ShoppingCart}
          href="/admin/orders"
          borderColor="border-l-cyan-500"
          iconBg="bg-cyan-50 text-cyan-600"
        />
        <StatCard
          title="Approved Stores"
          value={d?.stores.approved ?? 0}
          icon={CheckCircle}
          href="/admin/stores?status=approved"
          borderColor="border-l-emerald-500"
          iconBg="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 pb-4">
            {[
              {
                href: '/admin/stores?status=pending',
                icon: Clock,
                label: 'Pending Stores',
                iconClass: 'text-amber-500',
                badge: pendingCount > 0 ? pendingCount : undefined,
              },
              {
                href: '/admin/users?role=seller',
                icon: Users,
                label: 'View Sellers',
                iconClass: 'text-blue-500',
              },
              {
                href: '/admin/plans',
                icon: DollarSign,
                label: 'Manage Plans',
                iconClass: 'text-emerald-500',
              },
              {
                href: '/admin/billing/subscriptions',
                icon: ShoppingCart,
                label: 'Subscriptions',
                iconClass: 'text-violet-500',
              },
            ].map(({ href, icon: Icon, label, iconClass, badge }) => (
              <Link key={href} href={href}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs font-normal"
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} />
                  <span className="truncate">{label}</span>
                  {badge !== undefined && (
                    <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      {badge}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Store breakdown */}
        <Card>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold">Store Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-4">
            {[
              { label: 'Approved', value: d?.stores.approved ?? 0, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
              { label: 'Pending', value: d?.stores.pending ?? 0, color: 'bg-amber-400', textColor: 'text-amber-600' },
              {
                label: 'Other',
                value: Math.max(0, (d?.stores.total ?? 0) - (d?.stores.approved ?? 0) - (d?.stores.pending ?? 0)),
                color: 'bg-zinc-300',
                textColor: 'text-zinc-500',
              },
            ].map(({ label, value, color, textColor }) => {
              const pct = totalStores > 0 ? (value / totalStores) * 100 : 0;
              return (
                <div key={label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">{label}</span>
                    <span className={`font-semibold tabular-nums ${textColor}`}>{value}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
