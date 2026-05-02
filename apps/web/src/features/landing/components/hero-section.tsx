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

export const HeroSection = () => (
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
);
