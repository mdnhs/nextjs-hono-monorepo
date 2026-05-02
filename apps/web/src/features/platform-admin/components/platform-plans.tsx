'use client';

import { useState } from 'react';
import { usePlatformPlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../hooks/api/query/use-plans';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Loader2, Plus, Edit, Trash2, RefreshCw, CreditCard,
  Check, Globe, BarChart2, Headphones, Zap, Code2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PlatformPlan, PlanCreateData } from '../types';
import { PageHeader } from './ui/page-header';

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
function PlansSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-2 pt-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-3 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature icons ─────────────────────────────────────────────────────── */
const FEATURE_ICONS: Record<string, React.ElementType> = {
  customDomain: Globe,
  analytics: BarChart2,
  prioritySupport: Headphones,
  removeBranding: Zap,
  apiAccess: Code2,
};

const FEATURE_LABELS: Record<string, string> = {
  customDomain: 'Custom Domain',
  analytics: 'Analytics',
  prioritySupport: 'Priority Support',
  removeBranding: 'Remove Branding',
  apiAccess: 'API Access',
};

/* ─── Plan form ─────────────────────────────────────────────────────────── */
const EMPTY_FORM: PlanCreateData = {
  name: '', slug: '', description: '',
  priceMonthly: 0, priceYearly: 0, trialDays: 0,
  maxStores: 1, maxProducts: null, maxOrders: null, maxStorageMB: 500,
  customDomain: false, analytics: false, prioritySupport: false, removeBranding: false, apiAccess: false,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function PlanFormDialog({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: PlatformPlan | null }) {
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const isEdit = !!initial;

  const [form, setForm] = useState<PlanCreateData>(() =>
    initial ? {
      name: initial.name, slug: initial.slug, description: initial.description ?? '',
      priceMonthly: Number(initial.priceMonthly), priceYearly: Number(initial.priceYearly),
      trialDays: initial.trialDays, maxStores: initial.maxStores,
      maxProducts: initial.maxProducts, maxOrders: initial.maxOrders, maxStorageMB: initial.maxStorageMB,
      customDomain: initial.customDomain, analytics: initial.analytics,
      prioritySupport: initial.prioritySupport, removeBranding: initial.removeBranding, apiAccess: initial.apiAccess,
    } : EMPTY_FORM
  );

  const set = (key: keyof PlanCreateData, val: any) => setForm((f) => ({ ...f, [key]: val }));
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!form.name || !form.slug) { toast.error('Name and slug are required'); return; }
    try {
      if (isEdit && initial) {
        await updateMutation.mutateAsync({ id: initial.id, data: form });
        toast.success('Plan updated');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Plan created');
      }
      onClose();
    } catch { toast.error(isEdit ? 'Failed to update plan' : 'Failed to create plan'); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name *</label>
              <Input value={form.name} onChange={(e) => { set('name', e.target.value); if (!isEdit) set('slug', slugify(e.target.value)); }} placeholder="Starter" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slug *</label>
              <Input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} placeholder="starter" className="font-mono text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
            <Textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="Brief plan description…" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly ($)</label>
              <Input type="number" min={0} step={0.01} value={form.priceMonthly} onChange={(e) => set('priceMonthly', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Yearly ($)</label>
              <Input type="number" min={0} step={0.01} value={form.priceYearly} onChange={(e) => set('priceYearly', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trial Days</label>
              <Input type="number" min={0} value={form.trialDays ?? 0} onChange={(e) => set('trialDays', parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'maxStores', label: 'Max Stores' },
              { key: 'maxProducts', label: 'Max Products' },
              { key: 'maxOrders', label: 'Max Orders' },
              { key: 'maxStorageMB', label: 'Storage (MB)' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
                <Input
                  type="number" min={1}
                  value={(form as any)[key] ?? ''}
                  onChange={(e) => set(key as any, e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Unlimited"
                />
              </div>
            ))}
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Features</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                const Icon = FEATURE_ICONS[key];
                return (
                  <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted/50">
                    <Switch checked={!!(form as any)[key]} onCheckedChange={(c) => set(key as any, c)} id={key} />
                    <div className="flex items-center gap-1.5">
                      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="text-sm">{label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Plan card ─────────────────────────────────────────────────────────── */
const PLAN_ACCENTS: Record<string, { border: string; badge?: string }> = {
  starter: { border: 'border-t-zinc-400' },
  basic:   { border: 'border-t-blue-400' },
  pro:     { border: 'border-t-violet-500', badge: 'Most Popular' },
  enterprise: { border: 'border-t-amber-500', badge: 'Enterprise' },
};

function PlanCard({ plan, onEdit, onDelete, onToggle, isUpdating }: {
  plan: PlatformPlan;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isUpdating: boolean;
}) {
  const accent = PLAN_ACCENTS[plan.slug] ?? { border: 'border-t-zinc-300' };
  const features = Object.entries(FEATURE_LABELS).filter(([key]) => (plan as any)[key]);
  const limits = [
    { label: 'Stores', value: plan.maxStores ?? '∞' },
    { label: 'Products', value: plan.maxProducts ?? '∞' },
    { label: 'Orders', value: plan.maxOrders ?? '∞' },
    { label: 'Storage', value: plan.maxStorageMB ? `${plan.maxStorageMB}MB` : '∞' },
  ];

  return (
    <div className={cn(
      'relative flex flex-col rounded-xl border-t-2 bg-card shadow-sm transition-shadow hover:shadow-md',
      'border border-border',
      accent.border
    )}>
      {accent.badge && (
        <div className="absolute -top-px right-4">
          <span className="inline-flex items-center rounded-b-md bg-violet-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            {accent.badge}
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold">{plan.name}</h3>
            {plan.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{plan.description}</p>
            )}
          </div>
          <Switch
            checked={plan.status === 'ACTIVE'}
            onCheckedChange={onToggle}
            disabled={isUpdating}
            className="shrink-0"
          />
        </div>

        {/* Pricing */}
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">
            ${Number(plan.priceMonthly).toFixed(0)}
          </span>
          <span className="text-sm text-muted-foreground">/mo</span>
          {Number(plan.priceYearly) > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ${Number(plan.priceYearly).toFixed(0)}/yr
            </span>
          )}
        </div>
        {plan.trialDays > 0 && (
          <p className="mt-0.5 text-xs text-blue-600 font-medium">{plan.trialDays}-day free trial</p>
        )}
        <p className={cn('mt-1 text-[11px] font-semibold uppercase tracking-wider', plan.status === 'ACTIVE' ? 'text-emerald-600' : 'text-zinc-400')}>
          {plan.status}
        </p>

        {/* Limits */}
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-muted/40 p-3">
          {limits.map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-1">
              <span className="text-xs font-semibold">{String(value)}</span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {features.map(([key, label]) => {
              const Icon = FEATURE_ICONS[key];
              return (
                <li key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="flex items-center gap-1">
                    {Icon && <Icon className="h-3 w-3" />}{label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 border-t bg-muted/20 px-4 py-3">
        <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={onEdit}>
          <Edit className="h-3 w-3" /> Edit
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
export const PlatformPlans = () => {
  const { data, isLoading, error, refetch } = usePlatformPlans();
  const deleteMutation = useDeletePlan();
  const updateMutation = useUpdatePlan();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PlatformPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlatformPlan | null>(null);

  const plans = (data?.data as PlatformPlan[]) || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Plan deleted');
      setDeleteTarget(null);
    } catch { toast.error('Failed to delete plan'); }
  };

  const handleToggleStatus = async (plan: PlatformPlan) => {
    try {
      await updateMutation.mutateAsync({ id: plan.id, data: { status: plan.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE' } });
      toast.success(`Plan ${plan.status === 'ACTIVE' ? 'hidden' : 'activated'}`);
    } catch { toast.error('Failed to update plan'); }
  };

  if (isLoading) return <PlansSkeleton />;

  if (error || data?.error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">{data?.message ?? 'Failed to load plans'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Plans"
        description={`${plans.length} plan${plans.length !== 1 ? 's' : ''}`}
        action={
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Plan
          </Button>
        }
      />

      {plans.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed">
          <CreditCard className="h-10 w-10 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No plans yet</p>
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Create first plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => { setEditTarget(plan); setFormOpen(true); }}
              onDelete={() => setDeleteTarget(plan)}
              onToggle={() => handleToggleStatus(plan)}
              isUpdating={updateMutation.isPending}
            />
          ))}
        </div>
      )}

      <PlanFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        initial={editTarget}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the plan. Existing subscriptions on this plan will not be automatically migrated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
