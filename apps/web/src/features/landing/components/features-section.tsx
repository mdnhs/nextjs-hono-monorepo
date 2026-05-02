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

export const FeaturesSection = () => (
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
);
