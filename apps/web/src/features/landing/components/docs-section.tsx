import Link from 'next/link';
import {
  Rocket,
  Boxes,
  KeyRound,
  Webhook,
  CreditCard,
  Shield,
  BookOpen,
  Terminal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DocCard {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  articles: number;
}

const SECTIONS: DocCard[] = [
  {
    icon: Rocket,
    title: 'Quick start',
    description: 'Spin up your first store and accept a test order in under ten minutes.',
    href: '/docs/quick-start',
    articles: 6,
  },
  {
    icon: Boxes,
    title: 'Multi-tenancy',
    description: 'How tenants, scopes, and isolation work end-to-end.',
    href: '/docs/multi-tenancy',
    articles: 12,
  },
  {
    icon: KeyRound,
    title: 'Auth & RBAC',
    description: 'Sessions, roles, permissions, impersonation, and audit log.',
    href: '/docs/auth',
    articles: 9,
  },
  {
    icon: CreditCard,
    title: 'Payments',
    description: 'Stripe Connect setup, refunds, disputes, and split payouts.',
    href: '/docs/payments',
    articles: 14,
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Subscribe to platform events with HMAC-signed delivery.',
    href: '/docs/webhooks',
    articles: 8,
  },
  {
    icon: Terminal,
    title: 'API reference',
    description: 'REST + RPC endpoints, typed clients, and rate limits.',
    href: '/docs/api',
    articles: 42,
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Threat model, data handling, and compliance posture.',
    href: '/docs/security',
    articles: 7,
  },
  {
    icon: BookOpen,
    title: 'Guides',
    description: 'End-to-end recipes for common platform workflows.',
    href: '/docs/guides',
    articles: 21,
  },
];

const QUICK_LINKS = [
  { label: 'Install the CLI', href: '/docs/quick-start/cli' },
  { label: 'Create a tenant via API', href: '/docs/multi-tenancy/create' },
  { label: 'Set up Stripe Connect', href: '/docs/payments/stripe-connect' },
  { label: 'Verify a webhook signature', href: '/docs/webhooks/verify' },
  { label: 'Implement custom roles', href: '/docs/auth/custom-roles' },
];

export const DocsSection = () => (
  <section className='py-12' style={{ backgroundColor: '#F8F8F6' }}>
    <div className='mx-auto max-w-[1280px] px-6'>
      {/* Search bar */}
      <div
        className='mb-12 flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5'
        style={{ borderColor: 'rgba(0,0,0,0.1)' }}
      >
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' aria-hidden>
          <circle cx='8' cy='8' r='5.5' stroke='#9CA3AF' strokeWidth='1.5' />
          <path
            d='M12 12l3 3'
            stroke='#9CA3AF'
            strokeWidth='1.5'
            strokeLinecap='round'
          />
        </svg>
        <span className='flex-1 text-sm' style={{ color: '#9CA3AF' }}>
          Search docs, guides, API endpoints…
        </span>
        <kbd
          className='rounded border px-1.5 py-0.5 text-[10px] font-medium'
          style={{
            borderColor: 'rgba(0,0,0,0.12)',
            color: '#6B6B6B',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Doc section grid */}
      <div
        className='grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-4'
        style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
      >
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className='group flex flex-col bg-[#F8F8F6] p-6 transition-colors hover:bg-[#EFEEEC]'
            >
              <div
                className='mb-5 flex h-9 w-9 items-center justify-center rounded-lg'
                style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}
              >
                <Icon className='h-[18px] w-[18px]' style={{ color: '#0A0A0A' }} />
              </div>

              <h3
                className='mb-2 text-base font-bold leading-tight'
                style={{
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  color: '#0A0A0A',
                }}
              >
                {s.title}
              </h3>

              <p
                className='mb-5 flex-1 text-xs leading-relaxed'
                style={{ color: '#6B6B6B' }}
              >
                {s.description}
              </p>

              <div className='flex items-center justify-between'>
                <span className='text-[11px]' style={{ color: '#9CA3AF' }}>
                  {s.articles} articles
                </span>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 14 14'
                  fill='none'
                  className='transition-transform group-hover:translate-x-0.5'
                  aria-hidden
                >
                  <path
                    d='M3 7h8M7.5 3.5L11 7l-3.5 3.5'
                    stroke='#0A0A0A'
                    strokeWidth='1.4'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick links + CTA strip */}
      <div className='mt-16 grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr]'>
        <div>
          <h2
            className='mb-6 text-2xl font-black'
            style={{
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              color: '#0A0A0A',
            }}
          >
            Popular this week
          </h2>
          <ul className='divide-y' style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            {QUICK_LINKS.map((q) => (
              <li key={q.label}>
                <Link
                  href={q.href}
                  className='flex items-center justify-between py-4 text-sm transition-colors hover:opacity-70'
                  style={{ color: '#0A0A0A' }}
                >
                  <span>{q.label}</span>
                  <svg width='14' height='14' viewBox='0 0 14 14' fill='none' aria-hidden>
                    <path
                      d='M3 7h8M7.5 3.5L11 7l-3.5 3.5'
                      stroke='#0A0A0A'
                      strokeWidth='1.4'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div
          className='rounded-2xl p-8'
          style={{ backgroundColor: '#0A0A0A' }}
        >
          <h3
            className='mb-3 text-2xl font-black'
            style={{
              fontFamily: 'var(--font-heading)',
              color: '#F8F8F6',
              letterSpacing: '-0.03em',
            }}
          >
            Need a hand?
          </h3>
          <p
            className='mb-6 text-sm leading-relaxed'
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Drop into our developer Slack or open a ticket. Median response time on Growth is under
            four hours.
          </p>
          <div className='flex flex-wrap gap-2'>
            <Link
              href='/contact'
              className='inline-flex items-center gap-2 rounded-lg bg-[#F8F8F6] px-4 py-2.5 text-xs font-semibold text-[#0A0A0A] transition-colors hover:bg-[#E8E8E6]'
            >
              Contact support
            </Link>
            <Link
              href='/community'
              className='inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-colors'
              style={{
                color: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              Join Slack
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);
