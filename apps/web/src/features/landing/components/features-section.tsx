import { LayoutDashboard, Globe, ShoppingCart, BarChart3, Shield, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
}

const features: Feature[] = [
  {
    icon: LayoutDashboard,
    title: 'Multi-Store Dashboard',
    description:
      'Manage every seller store, order, and product from a single unified admin panel. Full visibility, zero context-switching.',
    tag: 'Admin',
  },
  {
    icon: Globe,
    title: 'Custom Storefronts',
    description:
      'Each seller gets an isolated tenant with their own domain, branding, and product catalog — fully independent.',
    tag: 'Sellers',
  },
  {
    icon: ShoppingCart,
    title: 'Order Management',
    description:
      'Real-time order tracking across all stores. From placement to delivery, every step is visible and actionable.',
    tag: 'Operations',
  },
  {
    icon: BarChart3,
    title: 'Revenue Analytics',
    description:
      'Platform-wide financial insights. Monitor GMV, take rates, and growth trends across your entire seller network.',
    tag: 'Analytics',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Granular permission layers for Admins, Sellers, Staff, and Buyers. Each role sees exactly what they need, nothing more.',
    tag: 'Security',
  },
  {
    icon: Zap,
    title: 'Edge-Ready Infrastructure',
    description:
      'Built to scale from day one. From your first sale to your millionth — no configuration changes required.',
    tag: 'Platform',
  },
];

export const FeaturesSection = () => (
  <section className='py-24' style={{ backgroundColor: '#F8F8F6' }}>
    <div className='mx-auto max-w-[1280px] px-6'>
      {/* Section label */}
      <div className='mb-16 flex items-center gap-3'>
        <div className='h-px w-8' style={{ backgroundColor: '#0A0A0A' }} />
        <span
          className='text-xs font-semibold uppercase'
          style={{
            color: '#6B6B6B',
            letterSpacing: '0.15em',
            fontFamily: 'var(--font-sans)',
          }}
        >
          What you get
        </span>
      </div>

      {/* 2-column feature grid */}
      <div
        className='grid grid-cols-1 gap-px md:grid-cols-2'
        style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
      >
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className='group bg-[#F8F8F6] p-8 transition-all duration-200 hover:bg-[#EFEEEC]'
              style={{ willChange: 'transform' }}
            >
              {/* Icon + tag row */}
              <div className='mb-6 flex items-start justify-between'>
                <div
                  className='flex h-10 w-10 items-center justify-center rounded-lg'
                  style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}
                >
                  <Icon className='h-5 w-5' style={{ color: '#0A0A0A' }} />
                </div>
                <span
                  className='rounded px-2 py-1 text-xs font-medium'
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: '#6B6B6B' }}
                >
                  {f.tag}
                </span>
              </div>

              {/* Title */}
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

              {/* Description */}
              <p className='text-sm leading-relaxed' style={{ color: '#6B6B6B' }}>
                {f.description}
              </p>

              {/* Hover CTA */}
              <div
                className='mt-6 flex items-center gap-1.5 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100'
                style={{ color: '#0A0A0A' }}
              >
                Learn more
                <svg width='12' height='12' viewBox='0 0 12 12' fill='none' aria-hidden>
                  <path
                    d='M2 6h8M7 3l3 3-3 3'
                    stroke='currentColor'
                    strokeWidth='1.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
