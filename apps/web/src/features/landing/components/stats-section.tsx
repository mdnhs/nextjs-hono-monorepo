const STATS = [
  { value: '2,000+', label: 'Active Sellers' },
  { value: '50K+', label: 'Orders / month' },
  { value: '40+', label: 'Countries' },
  { value: '99.9%', label: 'Uptime SLA' },
];

export const StatsSection = () => (
  <section
    className='border-y'
    style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#F8F8F6' }}
  >
    <div className='mx-auto max-w-[1280px] px-6 py-12'>
      <div className='grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0'>
        {STATS.map((stat, i) => (
          <div
            key={stat.value}
            className='text-center'
            style={
              i > 0
                ? { borderLeft: '1px solid rgba(0,0,0,0.08)' }
                : undefined
            }
          >
            <p
              className='mb-1 text-3xl font-black tracking-tight'
              style={{ fontFamily: 'var(--font-heading)', color: '#0A0A0A' }}
            >
              {stat.value}
            </p>
            <p className='text-sm' style={{ color: '#9CA3AF' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
