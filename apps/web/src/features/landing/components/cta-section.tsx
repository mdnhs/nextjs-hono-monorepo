import Link from 'next/link';

export const CtaSection = () => (
  <section className='pb-24 pt-4'>
    <div className='mx-auto max-w-[1280px] px-6'>
      <div
        className='relative overflow-hidden rounded-2xl'
        style={{ backgroundColor: '#0A0A0A' }}
      >
        {/* Dot-grid texture */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />

        {/* Subtle radial glow top-left */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(ellipse at 15% 40%, rgba(255,255,255,0.04) 0%, transparent 55%)',
          }}
        />

        <div className='relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]'>
          {/* Left — CTA copy */}
          <div className='p-12 md:p-16'>
            <h2
              className='mb-4 font-black leading-none'
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(32px, 4vw, 56px)',
                letterSpacing: '-0.04em',
                color: '#F8F8F6',
              }}
            >
              Ready to
              <br />
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>launch?</span>
            </h2>
            <p
              className='mb-8 max-w-xs text-base leading-relaxed'
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Get your marketplace live today. No credit card required. Cancel anytime.
            </p>
            <div className='flex flex-wrap items-center gap-3'>
              <Link
                href='/register'
                className='inline-flex items-center gap-2 rounded-xl bg-[#F8F8F6] px-6 py-3.5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#E8E8E6]'
              >
                Create your store
                <svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden>
                  <path
                    d='M3 8h10M9 4l4 4-4 4'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </Link>
              <Link
                href='/login'
                className='inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium transition-colors'
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Vertical divider */}
          <div
            className='my-12 hidden w-px self-stretch md:block'
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          />

          {/* Right — testimonial */}
          <div className='flex flex-col justify-center border-t p-12 md:border-t-0 md:p-16' style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {/* Quote mark */}
            <div
              className='mb-4 text-4xl leading-none'
              style={{ color: 'rgba(255,255,255,0.12)', fontFamily: 'Georgia, serif' }}
            >
              &ldquo;
            </div>

            <p
              className='mb-8 text-base leading-relaxed'
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Shoply let us go from zero to 40 active sellers in under a month.
              The multi-tenant setup saved us months of infrastructure work.
            </p>

            {/* Author */}
            <div className='flex items-center gap-3'>
              <div
                className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full'
                style={{ backgroundColor: '#A8C4B8' }}
              >
                <span
                  className='text-xs font-bold text-[#0A0A0A]'
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  SK
                </span>
              </div>
              <div>
                <p
                  className='text-sm font-semibold'
                  style={{ color: '#F8F8F6', fontFamily: 'var(--font-heading)' }}
                >
                  Sarah K.
                </p>
                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.3)' }}>
                  CEO, Marketly
                </p>
              </div>
              {/* Rating */}
              <div className='ml-auto flex items-center gap-0.5'>
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width='12' height='12' viewBox='0 0 12 12' fill='none' aria-hidden>
                    <path
                      d='M6 1l1.3 2.6L10 4l-2 1.95.47 2.74L6 7.4l-2.47 1.3L4 5.95 2 4l2.7-.4L6 1z'
                      fill='rgba(255,255,255,0.25)'
                    />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
