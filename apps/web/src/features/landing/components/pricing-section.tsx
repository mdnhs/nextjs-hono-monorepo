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
    features: [
      '1 storefront',
      'Up to 100 products',
      '500 orders / month',
      'Community support',
      'Shoply subdomain',
    ],
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
      'Priority email support',
      'Advanced analytics',
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
    features: [
      'Unlimited stores',
      'Dedicated infrastructure',
      'SSO + SAML',
      '99.99% uptime SLA',
      'Named CSM + 24/7 support',
      'Custom contracts',
    ],
    cta: 'Contact sales',
    href: '/contact',
  },
];

const COMPARISON_ROWS = [
  { label: 'Stores', starter: '1', growth: '25', enterprise: 'Unlimited' },
  { label: 'Products', starter: '100', growth: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Custom domains', starter: false, growth: true, enterprise: true },
  { label: 'API access', starter: 'Read only', growth: 'Full', enterprise: 'Full' },
  { label: 'Webhooks', starter: false, growth: true, enterprise: true },
  { label: 'SSO / SAML', starter: false, growth: false, enterprise: true },
  { label: 'Audit log retention', starter: '7 days', growth: '90 days', enterprise: 'Unlimited' },
  { label: 'Uptime SLA', starter: '—', growth: '99.9%', enterprise: '99.99%' },
];

const Cell = ({ value }: { value: string | boolean }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden>
        <path
          d='M3.5 8.5l3 3 6-6'
          stroke='#0A0A0A'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ) : (
      <span style={{ color: '#D1D5DB' }}>—</span>
    );
  }
  return <span style={{ color: '#0A0A0A', fontWeight: 500 }}>{value}</span>;
};

export const PricingSection = () => (
  <section className='py-12' style={{ backgroundColor: '#F8F8F6' }}>
    <div className='mx-auto max-w-[1280px] px-6'>
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

      {/* Comparison table */}
      <div className='mt-24'>
        <h2
          className='mb-8 text-3xl font-black'
          style={{
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.03em',
            color: '#0A0A0A',
          }}
        >
          Compare plans
        </h2>

        <div
          className='overflow-hidden rounded-xl border'
          style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'white' }}
        >
          <div
            className='grid grid-cols-4 px-6 py-4 text-xs font-semibold uppercase'
            style={{
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              color: '#6B6B6B',
              letterSpacing: '0.1em',
              backgroundColor: '#F8F8F6',
            }}
          >
            <span>Feature</span>
            <span>Starter</span>
            <span>Growth</span>
            <span>Enterprise</span>
          </div>

          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.label}
              className='grid grid-cols-4 items-center px-6 py-4 text-sm'
              style={{
                borderBottom:
                  i < COMPARISON_ROWS.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <span style={{ color: '#6B6B6B' }}>{row.label}</span>
              <Cell value={row.starter} />
              <Cell value={row.growth} />
              <Cell value={row.enterprise} />
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className='mt-24'>
        <h2
          className='mb-8 text-3xl font-black'
          style={{
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.03em',
            color: '#0A0A0A',
          }}
        >
          Frequently asked
        </h2>
        <div className='grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2'>
          {[
            {
              q: 'Can I switch plans later?',
              a: 'Yes — upgrade or downgrade any time. We prorate the difference automatically.',
            },
            {
              q: 'Do you take a cut of seller revenue?',
              a: 'No. Your sellers pay you, you pay Shoply a fixed monthly fee. We never sit between you and your money.',
            },
            {
              q: 'What payment processors do you support?',
              a: 'Stripe Connect, Adyen, and PayPal Marketplace are supported out of the box on Growth and Enterprise.',
            },
            {
              q: 'Is there a free trial on Growth?',
              a: '14 days, no credit card required. Cancel before day 14 and you owe nothing.',
            },
          ].map((item) => (
            <div key={item.q}>
              <h3
                className='mb-2 text-base font-bold'
                style={{ fontFamily: 'var(--font-heading)', color: '#0A0A0A' }}
              >
                {item.q}
              </h3>
              <p className='text-sm leading-relaxed' style={{ color: '#6B6B6B' }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
