import Link from 'next/link';

const GridBackground = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 overflow-hidden"
    style={{
      backgroundImage: `
        linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '64px 64px',
    }}
  />
);

const features = [
  {
    number: '01',
    title: 'Multi-Store Dashboard',
    description:
      'Manage every seller store, order, and product from a single unified admin panel. Full visibility, zero context-switching.',
    tag: 'Admin',
  },
  {
    number: '02',
    title: 'Custom Storefronts',
    description:
      'Each seller gets an isolated tenant with their own domain, branding, and product catalog — fully independent.',
    tag: 'Sellers',
  },
  {
    number: '03',
    title: 'Scales With You',
    description:
      'Built on edge-ready infrastructure. From your first sale to your millionth — no configuration changes required.',
    tag: 'Platform',
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <GridBackground />

        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none leading-none font-black"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(120px, 22vw, 340px)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(0,0,0,0.06)',
            letterSpacing: '-0.04em',
            userSelect: 'none',
          }}
        >
          SELL
        </div>

        <div className="max-w-[1280px] mx-auto px-6 pt-24 pb-32 relative">
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-8"
            style={{
              backgroundColor: 'rgba(0,0,0,0.06)',
              color: '#444',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#22C55E' }}
            />
            Multi-Tenant Commerce Platform
          </div>

          <h1
            className="font-black leading-none mb-6"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(52px, 9vw, 128px)',
              letterSpacing: '-0.04em',
              lineHeight: 0.92,
            }}
          >
            Sell Everywhere.
            <br />
            <span style={{ color: '#9CA3AF' }}>Manage Once.</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
            style={{ color: '#6B6B6B' }}
          >
            Launch your marketplace in minutes. Give every seller their own storefront while you
            stay in control — one platform, unlimited stores.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all text-[#F8F8F6] bg-[#0A0A0A] hover:bg-[#1A1A1A] hover:-translate-y-px"
            >
              Start for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm transition-colors text-[#0A0A0A] hover:bg-black/[0.04]"
              style={{ border: '1px solid rgba(0,0,0,0.15)' }}
            >
              View demo
            </Link>
          </div>

          <div className="mt-14 flex items-center gap-3 text-sm" style={{ color: '#9CA3AF' }}>
            <div className="flex -space-x-2">
              {['#D4B896', '#A8C4B8', '#B8A8D4', '#D4A8B8', '#C4D4A8'].map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2"
                  style={{ backgroundColor: color, borderColor: '#F8F8F6' }}
                />
              ))}
            </div>
            <span>Trusted by 2,000+ merchants worldwide</span>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-[1280px] mx-auto px-6">
        <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.08)' }} />
      </div>

      {/* ── Features ── */}
      <section className="py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-px" style={{ backgroundColor: '#0A0A0A' }} />
            <span
              className="text-xs font-semibold uppercase"
              style={{ color: '#6B6B6B', letterSpacing: '0.15em' }}
            >
              What you get
            </span>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-px"
            style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
          >
            {features.map((f) => (
              <div
                key={f.number}
                className="group p-8 transition-colors bg-[#F8F8F6] hover:bg-[#F0F0EE]"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="text-xs font-mono font-bold" style={{ color: '#C4C4C0' }}>
                    {f.number}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: '#6B6B6B' }}
                  >
                    {f.tag}
                  </span>
                </div>

                <h3
                  className="text-xl font-bold mb-3 leading-tight"
                  style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
                  {f.description}
                </p>

                <div
                  className="mt-8 flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#0A0A0A' }}
                >
                  Learn more
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                      d="M2 6h8M7 3l3 3-3 3"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="pb-24">
        <div className="max-w-[1280px] mx-auto px-6">
        <div
          className="rounded-2xl p-12 md:p-16 relative overflow-hidden"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
          <div className="relative">
            <h2
              className="font-black mb-4 leading-none"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(32px, 5vw, 60px)',
                letterSpacing: '-0.035em',
                color: '#F8F8F6',
              }}
            >
              Ready to launch?
            </h2>
            <p className="text-base mb-8 max-w-md" style={{ color: '#6B6B6B' }}>
              Get your marketplace live today. No credit card required.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors text-[#0A0A0A] bg-[#F8F8F6] hover:bg-[#E8E8E6]"
            >
              Create your store
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
