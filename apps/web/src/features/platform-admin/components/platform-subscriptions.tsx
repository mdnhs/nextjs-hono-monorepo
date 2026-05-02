'use client';

import { useState } from 'react';
import { usePlatformSubscriptions, useCancelSubscription, useUpdateSubscription } from '../hooks/api/query/use-billing';
import { usePlatformPlans } from '../hooks/api/query/use-plans';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Store, CreditCard, Calendar, AlertCircle, RefreshCw, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { PlatformSubscription } from '../types';
import { PageHeader } from './ui/page-header';
import { FilterTabs } from './ui/filter-tabs';
import { StatusBadge } from './ui/status-badge';
import { InitialAvatar } from './ui/initial-avatar';

function TableSkeleton() {
  return (
    <Card>
      <div className="divide-y">
        <div className="flex gap-4 bg-muted/50 px-4 py-3">
          {[140, 100, 80, 70, 100, 120].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-32 rounded-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
  { value: 'past_due', label: 'Past Due' },
];

export const PlatformSubscriptions = ({ status }: { status?: string }) => {
  const router = useRouter();
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [changePlanTarget, setChangePlanTarget] = useState<PlatformSubscription | null>(null);
  const [newPlanId, setNewPlanId] = useState('');

  const params = status ? { status } : undefined;
  const { data, isLoading, error, refetch } = usePlatformSubscriptions(params);
  const { data: plansData } = usePlatformPlans();
  const cancelMutation = useCancelSubscription();
  const updateMutation = useUpdateSubscription();

  const subscriptions = (data?.data as PlatformSubscription[]) || [];
  const plans = plansData?.data || [];

  const handleTabChange = (val: string) => {
    if (val === 'all') router.push('/admin/billing/subscriptions');
    else router.push(`/admin/billing/subscriptions?status=${val}`);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelMutation.mutateAsync(cancelTarget);
      toast.success('Subscription cancelled');
      setCancelTarget(null);
    } catch { toast.error('Failed to cancel subscription'); }
  };

  const handleChangePlan = async () => {
    if (!changePlanTarget || !newPlanId) return;
    try {
      await updateMutation.mutateAsync({ id: changePlanTarget.id, data: { planId: newPlanId } });
      toast.success('Plan updated');
      setChangePlanTarget(null);
      setNewPlanId('');
    } catch { toast.error('Failed to update plan'); }
  };

  if (isLoading) return <TableSkeleton />;

  if (error || data?.error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">{data?.message ?? 'Failed to load subscriptions'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Subscriptions"
        description={`${subscriptions.length} subscription${subscriptions.length !== 1 ? 's' : ''}${status ? ` · ${status}` : ''}`}
      />

      <FilterTabs tabs={STATUS_TABS} value={status || 'all'} onChange={handleTabChange} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {['Store', 'Plan', 'Status', 'Billing', 'Renews', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${i === 5 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center gap-2 py-16">
                      <Receipt className="h-10 w-10 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground">No subscriptions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <InitialAvatar name={sub.store.name} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{sub.store.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{sub.store.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-medium">{sub.plan.name}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">${Number(sub.plan.priceMonthly).toFixed(2)}/mo</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.status} dot />
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                      {sub.billingCycle}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => { setChangePlanTarget(sub); setNewPlanId(sub.planId); }}
                        >
                          Change Plan
                        </Button>
                        {sub.status !== 'CANCELLED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => setCancelTarget(sub.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!changePlanTarget} onOpenChange={(o) => !o && setChangePlanTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the plan for <strong>{changePlanTarget?.store.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-sm font-medium">New Plan</label>
            <Select value={newPlanId} onValueChange={(v) => setNewPlanId(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — ${Number(p.priceMonthly).toFixed(2)}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanTarget(null)}>Cancel</Button>
            <Button onClick={handleChangePlan} disabled={!newPlanId || updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              The subscription will be cancelled at the end of the current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              {cancelMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
