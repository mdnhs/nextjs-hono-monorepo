import Link from 'next/link';

const BAR_HEIGHTS = [38, 62, 28, 74, 50, 92, 44, 100, 66, 78];

const STAT_CARDS = [
  { label: 'Revenue', value: '$24,521', border: '#10B981', badge: '+12%', badgeBg: '#ECFDF5', badgeColor: '#059669' },
  { label: 'Orders', value: '1,248', border: '#3B82F6', badge: '+8%', badgeBg: '#EFF6FF', badgeColor: '#2563EB' },
  { label: 'Stores', value: '84', border: '#8B5CF6', badge: '+3', badgeBg: '#F5F3FF', badgeColor: '#7C3AED' },
  { label: 'Users', value: '3,291', border: '#F59E0B', badge: '+291', badgeBg: '#FFFBEB', badgeColor: '#D97706' },
];

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', active: true, w: 56 },
  { label: 'Stores', active: false, w: 40 },
  { label: 'Orders', active: false, w: 44 },
  { label: 'Users', active: false, w: 32 },
  { label: 'Plans', active: false, w: 28 },
  { label: 'Analytics', active: false, w: 52 },
];

const ORDER_ROWS = [
  { hue: 200, nameW: 70, status: 'Delivered', sBg: '#ECFDF5', sColor: '#059669' },
  { hue: 260, nameW: 85, status: 'Pending', sBg: '#FFFBEB', sColor: '#D97706' },
  { hue: 160, nameW: 60, status: 'Delivered', sBg: '#ECFDF5', sColor: '#059669' },
  { hue: 220, nameW: 75, status: 'Processing', sBg: '#EFF6FF', sColor: '#2563EB' },
];

const DashboardMockup = () => (
  <div className='relative mt-16 hidden md:block pb-16'>
    <div
      style={{
        transform: 'perspective(1400px) rotateX(6deg)',
        transformOrigin: 'center top',
      }}
    >
      {/* Browser shell */}
      <div
        className='overflow-hidden rounded-xl'
        style={{
          border: '1px solid rgba(0,0,0,0.11)',
          boxShadow:
            '0 40px 100px rgba(0,0,0,0.10), 0 12px 32px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Chrome bar */}
        <div
          className='flex items-center gap-3 border-b px-4 py-3'
          style={{ backgroundColor: '#EEECEA', borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <div className='flex items-center gap-1.5'>
            <div className='h-3 w-3 rounded-full' style={{ backgroundColor: '#FF5F57' }} />
            <div className='h-3 w-3 rounded-full' style={{ backgroundColor: '#FEBC2E' }} />
            <div className='h-3 w-3 rounded-full' style={{ backgroundColor: '#28C840' }} />
          </div>
          <div className='flex flex-1 justify-center'>
            <div
              className='flex h-6 w-64 items-center justify-center rounded-md'
              style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}
            >
              <span
                className='text-[11px]'
                style={{ color: '#9CA3AF', fontFamily: 'var(--font-sans)' }}
              >
                🔒 app.shoply.com/admin
              </span>
            </div>
          </div>
          <div className='flex items-center gap-1.5'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='h-4 w-4 rounded'
                style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}
              />
            ))}
          </div>
        </div>

        {/* Dashboard body */}
        <div className='flex' style={{ height: '380px', backgroundColor: '#F3F3F1' }}>
          {/* Sidebar */}
          <div
            className='flex w-48 flex-col border-r py-4'
            style={{ backgroundColor: 'white', borderColor: 'rgba(0,0,0,0.07)' }}
          >
            {/* Brand */}
            <div className='mb-5 flex items-center gap-2 px-4'>
              <div
                className='flex h-6 w-6 items-center justify-center rounded-md'
                style={{ backgroundColor: '#0A0A0A' }}
              >
                <span
                  className='text-[9px] font-black text-white'
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  SH
                </span>
              </div>
              <div
                className='h-2.5 w-12 rounded'
                style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}
              />
            </div>

            {/* Nav */}
            <div className='flex flex-col gap-0.5 px-2'>
              {SIDEBAR_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className='flex items-center gap-2.5 rounded-md px-2.5 py-2'
                  style={{ backgroundColor: item.active ? '#0A0A0A' : 'transparent' }}
                >
                  <div
                    className='h-3.5 w-3.5 rounded-sm'
                    style={{
                      backgroundColor: item.active
                        ? 'rgba(255,255,255,0.4)'
                        : 'rgba(0,0,0,0.11)',
                    }}
                  />
                  <div
                    className='h-2 rounded'
                    style={{
                      width: item.w,
                      backgroundColor: item.active
                        ? 'rgba(255,255,255,0.65)'
                        : 'rgba(0,0,0,0.09)',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* User row at bottom */}
            <div className='mt-auto flex items-center gap-2 border-t px-4 pt-4' style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
              <div
                className='h-7 w-7 rounded-full'
                style={{ backgroundColor: '#A8C4B8' }}
              />
              <div className='flex-1'>
                <div className='mb-1 h-2 w-16 rounded' style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
                <div className='h-1.5 w-10 rounded' style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />
              </div>
            </div>
          </div>

          {/* Main area */}
          <div className='flex-1 overflow-hidden p-5'>
            {/* Header row */}
            <div className='mb-5 flex items-center justify-between'>
              <div>
                <div className='mb-1.5 h-4 w-28 rounded' style={{ backgroundColor: 'rgba(0,0,0,0.13)' }} />
                <div className='h-2.5 w-40 rounded' style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />
              </div>
              <div className='flex items-center gap-2'>
                <div
                  className='h-7 w-20 rounded-lg'
                  style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}
                />
                <div
                  className='h-7 w-24 rounded-lg'
                  style={{ backgroundColor: '#0A0A0A' }}
                />
              </div>
            </div>

            {/* Stat cards */}
            <div className='mb-4 grid grid-cols-4 gap-3'>
              {STAT_CARDS.map((card) => (
                <div
                  key={card.label}
                  className='rounded-lg p-3'
                  style={{
                    backgroundColor: 'white',
                    borderLeft: `3px solid ${card.border}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className='mb-0.5 flex items-start justify-between'>
                    <span
                      className='text-sm font-bold'
                      style={{ fontFamily: 'var(--font-heading)', color: '#0A0A0A' }}
                    >
                      {card.value}
                    </span>
                    <span
                      className='rounded-full px-1.5 py-0.5 text-[9px] font-semibold'
                      style={{ backgroundColor: card.badgeBg, color: card.badgeColor }}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <div className='text-[10px]' style={{ color: '#9CA3AF' }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className='grid grid-cols-[1fr_1.6fr] gap-3'>
              {/* Bar chart */}
              <div
                className='rounded-lg p-4'
                style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
              >
                <div
                  className='mb-1 h-2.5 w-20 rounded'
                  style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                />
                <div
                  className='mb-4 h-1.5 w-14 rounded'
                  style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                />
                <div className='flex h-[88px] items-end gap-1'>
                  {BAR_HEIGHTS.map((h, i) => (
                    <div
                      key={i}
                      className='flex-1 rounded-t'
                      style={{
                        height: `${h}%`,
                        backgroundColor: i === 7 ? '#0A0A0A' : 'rgba(0,0,0,0.08)',
                      }}
                    />
                  ))}
                </div>
                <div className='mt-2 flex justify-between'>
                  {['Jan', 'Apr', 'Jul', 'Oct'].map((m) => (
                    <span key={m} className='text-[9px]' style={{ color: '#D1D5DB' }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent orders table */}
              <div
                className='rounded-lg p-4'
                style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
              >
                <div
                  className='mb-1 h-2.5 w-24 rounded'
                  style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                />
                <div
                  className='mb-4 h-1.5 w-16 rounded'
                  style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                />
                <div className='space-y-3'>
                  {ORDER_ROWS.map((row, i) => (
                    <div key={i} className='flex items-center gap-2.5'>
                      <div
                        className='h-6 w-6 shrink-0 rounded-full'
                        style={{ backgroundColor: `hsl(${row.hue}, 28%, 84%)` }}
                      />
                      <div className='min-w-0 flex-1'>
                        <div
                          className='mb-1 h-2 rounded'
                          style={{
                            width: `${row.nameW}%`,
                            backgroundColor: 'rgba(0,0,0,0.09)',
                          }}
                        />
                        <div
                          className='h-1.5 w-2/5 rounded'
                          style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                        />
                      </div>
                      <span
                        className='shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold'
                        style={{ backgroundColor: row.sBg, color: row.sColor }}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom fade */}
    <div
      className='pointer-events-none absolute bottom-0 left-0 right-0 h-36'
      style={{ background: 'linear-gradient(to bottom, transparent, #F8F8F6)' }}
    />
  </div>
);

export const HeroSection = () => (
  <section className='relative overflow-hidden' style={{ backgroundColor: '#F8F8F6' }}>
    {/* Grid background */}
    <div
      aria-hidden
      className='pointer-events-none absolute inset-0'
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }}
    />

    {/* Ghost watermark */}
    <div
      aria-hidden
      className='pointer-events-none absolute right-0 top-1/3 -translate-y-1/2 select-none font-black leading-none'
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(120px, 22vw, 340px)',
        color: 'transparent',
        WebkitTextStroke: '1px rgba(0,0,0,0.055)',
        letterSpacing: '-0.04em',
        userSelect: 'none',
      }}
    >
      SELL
    </div>

    <div className='relative mx-auto max-w-[1280px] px-6 pb-8 pt-24'>
      {/* Badge */}
      <div
        className='mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium'
        style={{
          backgroundColor: 'rgba(0,0,0,0.06)',
          color: '#444',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <span
          className='inline-block h-1.5 w-1.5 rounded-full'
          style={{ backgroundColor: '#22C55E' }}
        />
        Multi-Tenant Commerce Platform
      </div>

      {/* Heading */}
      <h1
        className='mb-6 font-black leading-none'
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

      {/* Subtext */}
      <p
        className='mb-10 max-w-xl text-lg leading-relaxed md:text-xl'
        style={{ color: '#6B6B6B' }}
      >
        Launch your marketplace in minutes. Give every seller their own storefront while you
        stay in control — one platform, unlimited stores.
      </p>

      {/* CTAs */}
      <div className='mb-12 flex flex-wrap items-center gap-4'>
        <Link
          href='/register'
          className='inline-flex items-center gap-2 rounded-xl bg-[#0A0A0A] px-6 py-3.5 text-sm font-semibold text-[#F8F8F6] transition-all hover:-translate-y-px hover:bg-[#1A1A1A]'
        >
          Start for free
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
          href='/demo'
          className='inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-black/[0.04]'
          style={{ border: '1px solid rgba(0,0,0,0.15)' }}
        >
          View demo
        </Link>
      </div>

      {/* Social proof */}
      <div className='flex items-center gap-3 text-sm' style={{ color: '#9CA3AF' }}>
        <div className='flex -space-x-2'>
          {['#D4B896', '#A8C4B8', '#B8A8D4', '#D4A8B8', '#C4D4A8'].map((color, i) => (
            <div
              key={i}
              className='h-7 w-7 rounded-full border-2'
              style={{ backgroundColor: color, borderColor: '#F8F8F6' }}
            />
          ))}
        </div>
        <span>Trusted by 2,000+ merchants worldwide</span>
      </div>

      {/* Dashboard mockup */}
      <DashboardMockup />
    </div>
  </section>
);
