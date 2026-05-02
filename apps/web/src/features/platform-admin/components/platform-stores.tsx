'use client';

import { useState } from 'react';
import { usePlatformStores, useApproveStore, useRejectStore, useSuspendStore } from '../hooks/api/query/use-stores';
import { usePlatformPlans } from '../hooks/api/query/use-plans';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, ExternalLink, CheckCircle, XCircle, PauseCircle, Store, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { PlatformStore } from '../types';
import { PageHeader } from './ui/page-header';
import { FilterTabs } from './ui/filter-tabs';
import { StatusBadge } from './ui/status-badge';
import { InitialAvatar } from './ui/initial-avatar';

function TableSkeleton() {
  return (
    <Card>
      <div className="divide-y">
        <div className="flex gap-4 bg-muted/50 px-4 py-3">
          {[120, 100, 80, 60, 80, 80, 100].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="ml-auto h-3 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28 rounded-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

export const PlatformStores = ({ status }: { status?: string }) => {
  const router = useRouter();
  const [selectedStore, setSelectedStore] = useState<PlatformStore | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const params = status ? { status } : undefined;
  const { data, isLoading, error, refetch } = usePlatformStores(params);
  const { data: plansData } = usePlatformPlans();
  const approveMutation = useApproveStore();
  const rejectMutation = useRejectStore();
  const suspendMutation = useSuspendStore();

  const stores = (data?.data as PlatformStore[]) || [];
  const plans = plansData?.data || [];

  const handleTabChange = (val: string) => {
    if (val === 'all') router.push('/admin/stores');
    else router.push(`/admin/stores?status=${val}`);
  };

  const handleApprove = async () => {
    if (!selectedStore) return;
    try {
      await approveMutation.mutateAsync({ id: selectedStore.id, data: selectedPlanId ? { planId: selectedPlanId } : undefined });
      toast.success(`${selectedStore.name} approved`);
      setApproveDialogOpen(false);
      setSelectedStore(null);
      setSelectedPlanId('');
    } catch { toast.error('Failed to approve store'); }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await rejectMutation.mutateAsync(rejectTarget);
      toast.success('Store rejected');
      setRejectTarget(null);
    } catch { toast.error('Failed to reject store'); }
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    try {
      await suspendMutation.mutateAsync(suspendTarget);
      toast.success('Store suspended');
      setSuspendTarget(null);
    } catch { toast.error('Failed to suspend store'); }
  };

  if (isLoading) return <TableSkeleton />;

  if (error || data?.error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">{data?.message ?? 'Failed to load stores'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Stores"
        description={`${stores.length} store${stores.length !== 1 ? 's' : ''}${status ? ` · ${status}` : ''}`}
      />

      <FilterTabs
        tabs={STATUS_TABS}
        value={status || 'all'}
        onChange={handleTabChange}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {['Store', 'Owner', 'Slug', 'Products', 'Status', 'Created', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${i === 6 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center gap-2 py-16">
                      <Store className="h-10 w-10 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground">No stores found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <InitialAvatar name={store.name} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{store.name}</p>
                          {store.customDomain && (
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ExternalLink className="h-2.5 w-2.5" />{store.customDomain}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{store.owner?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{store.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono">{store.slug}</code>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {store._count?.products ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={store.status} dot />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(store.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                        {store.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 border-emerald-200 text-xs text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                              onClick={() => { setSelectedStore(store); setApproveDialogOpen(true); }}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-3 w-3" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 border-red-200 text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
                              onClick={() => setRejectTarget(store.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                          </>
                        )}
                        {store.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 border-amber-200 text-xs text-amber-700 hover:bg-amber-50 hover:border-amber-300"
                            onClick={() => setSuspendTarget(store.id)}
                            disabled={suspendMutation.isPending}
                          >
                            <PauseCircle className="h-3 w-3" /> Suspend
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

      {/* Approve dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Store</DialogTitle>
            <DialogDescription>
              Approve <strong>{selectedStore?.name}</strong>. Optionally assign a subscription plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-sm font-medium">Subscription Plan <span className="font-normal text-muted-foreground">(optional)</span></label>
            <Select value={selectedPlanId} onValueChange={(v) => setSelectedPlanId(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="No plan — assign later" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No plan</SelectItem>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — ${Number(p.priceMonthly).toFixed(2)}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {approveMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Approve Store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this store?</AlertDialogTitle>
            <AlertDialogDescription>The store will be marked as rejected. The owner will need to reapply.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              {rejectMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!suspendTarget} onOpenChange={(o) => !o && setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend this store?</AlertDialogTitle>
            <AlertDialogDescription>Buyers will lose access until the store is reinstated.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend} className="bg-amber-600 hover:bg-amber-700">
              {suspendMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
