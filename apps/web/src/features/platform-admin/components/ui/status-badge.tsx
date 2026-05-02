import { cn } from '@/lib/utils';

type StatusVariant =
  | 'APPROVED' | 'ACTIVE' | 'DELIVERED'
  | 'PENDING' | 'TRIAL' | 'PROCESSING'
  | 'REJECTED' | 'CANCELLED' | 'EXPIRED'
  | 'SUSPENDED' | 'PAST_DUE' | 'REFUNDED'
  | 'SHIPPED' | 'HIDDEN' | 'BUYER' | 'SELLER' | 'ADMIN';

const VARIANT_STYLES: Record<string, string> = {
  APPROVED:   'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  ACTIVE:     'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  DELIVERED:  'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  PENDING:    'bg-amber-50  text-amber-700   ring-amber-200/60',
  TRIAL:      'bg-blue-50   text-blue-700    ring-blue-200/60',
  PROCESSING: 'bg-blue-50   text-blue-700    ring-blue-200/60',
  SHIPPED:    'bg-cyan-50   text-cyan-700    ring-cyan-200/60',
  REJECTED:   'bg-red-50    text-red-700     ring-red-200/60',
  CANCELLED:  'bg-red-50    text-red-700     ring-red-200/60',
  EXPIRED:    'bg-zinc-100  text-zinc-500    ring-zinc-200/60',
  SUSPENDED:  'bg-zinc-100  text-zinc-500    ring-zinc-200/60',
  HIDDEN:     'bg-zinc-100  text-zinc-500    ring-zinc-200/60',
  PAST_DUE:   'bg-orange-50 text-orange-700  ring-orange-200/60',
  REFUNDED:   'bg-zinc-100  text-zinc-500    ring-zinc-200/60',
  BUYER:      'bg-zinc-100  text-zinc-600    ring-zinc-200/60',
  SELLER:     'bg-blue-50   text-blue-700    ring-blue-200/60',
  ADMIN:      'bg-violet-50 text-violet-700  ring-violet-200/60',
};

const DOT_COLORS: Record<string, string> = {
  APPROVED: 'bg-emerald-500', ACTIVE: 'bg-emerald-500', DELIVERED: 'bg-emerald-500',
  PENDING: 'bg-amber-500', TRIAL: 'bg-blue-500', PROCESSING: 'bg-blue-500',
  SHIPPED: 'bg-cyan-500', REJECTED: 'bg-red-500', CANCELLED: 'bg-red-500',
  EXPIRED: 'bg-zinc-400', SUSPENDED: 'bg-zinc-400', HIDDEN: 'bg-zinc-400',
  PAST_DUE: 'bg-orange-500', REFUNDED: 'bg-zinc-400',
};

export function StatusBadge({ status, dot = false }: { status: string; dot?: boolean }) {
  const style = VARIANT_STYLES[status] ?? 'bg-zinc-100 text-zinc-500 ring-zinc-200/60';
  const dotColor = DOT_COLORS[status] ?? 'bg-zinc-400';
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', style)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />}
      {status}
    </span>
  );
}
