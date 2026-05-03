import {
  LayoutDashboard,
  Globe,
  ShoppingCart,
  BarChart3,
  Shield,
  Zap,
  CreditCard,
  Boxes,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DetailedFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
}

const FEATURES: DetailedFeature[] = [
  {
    icon: LayoutDashboard,
    title: 'Unified Admin Console',
    description:
      'A single command center for the platform owner. Drill into any tenant, override any record, audit any action.',
    bullets: ['Cross-tenant search', 'Impersonation with audit trail', 'Bulk actions across stores'],
  },
  {
    icon: Globe,
    title: 'Per-Seller Storefronts',
    description:
      'Every seller runs an isolated tenant: their own URL, theme, products, and customers. Strict data boundaries by default.',
    bullets: ['Custom domains', 'Theme tokens per tenant', 'Row-level isolation'],
  },
  {
    icon: ShoppingCart,
    title: 'End-to-End Orders',
    description:
      'From cart to fulfillment to refund. Every state transition is logged, idempotent, and webhook-ready.',
    bullets: ['Idempotent payment intents', 'Refund + dispute flows', 'Webhook fan-out'],
  },
  {
    icon: CreditCard,
    title: 'Flexible Billing',
    description:
      'Subscriptions, take rates, and one-off fees per tenant. Plans are config — change without redeploy.',
    bullets: ['Stripe Connect ready', 'Per-plan feature gates', 'Proration + invoices'],
  },
  {
    icon: BarChart3,
    title: 'Revenue & Cohorts',
    description:
      'GMV, MRR, and retention rolled up across all tenants — or filtered down to one. Export anywhere.',
    bullets: ['Realtime GMV', 'Cohort retention', 'CSV / API export'],
  },
  {
    icon: Shield,
    title: 'RBAC & Audit',
    description:
      'Granular roles for Platform, Store, and Buyer scopes. Every privileged action ends up in an immutable log.',
    bullets: ['Scoped roles + permissions', 'Immutable audit log', 'SOC2-friendly defaults'],
  },
  {
    icon: Boxes,
    title: 'Catalog at Scale',
    description:
      'Variants, inventory, and media handled per store. Bulk import, validation, and async indexing built in.',
    bullets: ['Bulk CSV import', 'Variant + inventory model', 'Async search indexing'],
  },
  {
    icon: Workflow,
    title: 'Webhooks & API',
    description:
      'A typed REST + RPC API powers the dashboard and your integrations. Same contracts, same auth.',
    bullets: ['Typed Hono RPC', 'HMAC-signed webhooks', 'Per-tenant API keys'],
  },
  {
    icon: Zap,
    title: 'Edge Performance',
    description:
      'Built on edge runtime + Postgres. Queries route to the closest region with strong consistency where it matters.',
    bullets: ['Edge-first runtime', 'Cached read replicas', 'Sub-100ms p95'],
  },
];

export const FeaturesDetailedSection = () => (
  <section className='py-24' style={{ backgroundColor: '#F8F8F6' }}>
    <div className='mx-auto max-w-[1280px] px-6'>
      <div
        className='grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-3'
        style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
      >
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className='bg-[#F8F8F6] p-8 transition-colors hover:bg-[#EFEEEC]'
            >
              <div
                className='mb-6 flex h-10 w-10 items-center justify-center rounded-lg'
                style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}
              >
                <Icon className='h-5 w-5' style={{ color: '#0A0A0A' }} />
              </div>

              <h3
                className='mb-3 text-xl font-bold leading-tight'
                style={{
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.025em',
                  color: '#0A0A0A',
                }}
              >
                {f.title}
              </h3>

              <p
                className='mb-5 text-sm leading-relaxed'
                style={{ color: '#6B6B6B' }}
              >
                {f.description}
              </p>

              <ul className='space-y-2'>
                {f.bullets.map((b) => (
                  <li
                    key={b}
                    className='flex items-start gap-2 text-xs'
                    style={{ color: '#0A0A0A' }}
                  >
                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 14 14'
                      fill='none'
                      className='mt-0.5 shrink-0'
                      aria-hidden
                    >
                      <path
                        d='M3 7.5l2.5 2.5L11 4.5'
                        stroke='#0A0A0A'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
