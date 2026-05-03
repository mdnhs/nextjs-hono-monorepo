import Link from 'next/link';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '$0',
    period: '/forever',
    description: 'For solo sellers exploring the platform.',
    features: ['1 storefront', 'Up to 100 products', '500 orders / month', 'Community support'],
    cta: 'Start free',
    href: '/register',
  },
  {
    name: 'Growth',
    price: '$49',
    period: '/month',
    description: 'For teams scaling a real marketplace.',
    features: [
      'Up to 25 stores',
      'Unlimited products',
      '50K orders / month',
      'Custom domains',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    href: '/register',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For platforms with strict compliance + scale needs.',
    features: ['Unlimited stores', 'SSO + SAML', '99.99% uptime SLA', 'Dedicated CSM'],
    cta: 'Contact sales',
    href: '/contact',
  },
];

export const PricingTeaserSection = () => (
  <section className='py-24' style={{ backgroundColor: '#F8F8F6' }}>
    <div className='mx-auto max-w-[1280px] px-6'>
      {/* Header row */}
      <div className='mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end'>
        <div>
          <div className='mb-6 flex items-center gap-3'>
            <div className='h-px w-8' style={{ backgroundColor: '#0A0A0A' }} />
            <span
              className='text-xs font-semibold uppercase'
              style={{
                color: '#6B6B6B',
                letterSpacing: '0.15em',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Pricing
            </span>
          </div>
          <h2
            className='max-w-2xl font-black leading-none'
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(40px, 6vw, 80px)',
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              color: '#0A0A0A',
            }}
          >
            Simple pricing.
            <br />
            <span style={{ color: '#9CA3AF' }}>No take rate.</span>
          </h2>
        </div>

        <Link
          href='/pricing'
          className='inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70'
          style={{ color: '#0A0A0A' }}
        >
          Compare all plans
          <svg width='14' height='14' viewBox='0 0 14 14' fill='none' aria-hidden>
            <path
              d='M3 7h8M7.5 3.5L11 7l-3.5 3.5'
              stroke='currentColor'
              strokeWidth='1.4'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </Link>
      </div>

      {/* Plan cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className='relative flex flex-col rounded-2xl p-8'
            style={{
              backgroundColor: plan.highlight ? '#0A0A0A' : 'white',
              border: plan.highlight ? 'none' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: plan.highlight
                ? '0 20px 50px rgba(0,0,0,0.18)'
                : '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {plan.highlight && (
              <span
                className='absolute -top-3 left-8 rounded-full px-3 py-1 text-[10px] font-semibold uppercase'
                style={{
                  backgroundColor: '#A8C4B8',
                  color: '#0A0A0A',
                  letterSpacing: '0.12em',
                }}
              >
                Most popular
              </span>
            )}

            <h3
              className='mb-2 text-lg font-bold'
              style={{
                fontFamily: 'var(--font-heading)',
                color: plan.highlight ? '#F8F8F6' : '#0A0A0A',
              }}
            >
              {plan.name}
            </h3>

            <div className='mb-3 flex items-baseline gap-1'>
              <span
                className='font-black leading-none'
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '48px',
                  letterSpacing: '-0.04em',
                  color: plan.highlight ? '#F8F8F6' : '#0A0A0A',
                }}
              >
                {plan.price}
              </span>
              {plan.period && (
                <span
                  className='text-sm'
                  style={{
                    color: plan.highlight ? 'rgba(255,255,255,0.45)' : '#9CA3AF',
                  }}
                >
                  {plan.period}
                </span>
              )}
            </div>

            <p
              className='mb-8 text-sm'
              style={{
                color: plan.highlight ? 'rgba(255,255,255,0.55)' : '#6B6B6B',
              }}
            >
              {plan.description}
            </p>

            <ul className='mb-8 flex-1 space-y-3'>
              {plan.features.map((f) => (
                <li
                  key={f}
                  className='flex items-start gap-2 text-sm'
                  style={{
                    color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#0A0A0A',
                  }}
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
                      stroke={plan.highlight ? '#A8C4B8' : '#0A0A0A'}
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className='inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-px'
              style={{
                backgroundColor: plan.highlight ? '#F8F8F6' : '#0A0A0A',
                color: plan.highlight ? '#0A0A0A' : '#F8F8F6',
              }}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);
