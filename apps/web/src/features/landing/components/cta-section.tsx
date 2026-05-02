import Link from 'next/link';

export const CtaSection = () => (
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
);
