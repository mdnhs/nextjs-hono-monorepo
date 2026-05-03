interface LegalBlock {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
}

interface LegalSectionProps {
  effectiveDate: string;
  intro: string;
  blocks: LegalBlock[];
  contactEmail: string;
}

export const LegalSection = ({
  effectiveDate,
  intro,
  blocks,
  contactEmail,
}: LegalSectionProps) => (
  <section className='py-12' style={{ backgroundColor: '#F8F8F6' }}>
    <div className='mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 md:grid-cols-[260px_1fr]'>
      {/* Sticky TOC */}
      <aside className='md:sticky md:top-24 md:self-start'>
        <div
          className='mb-3 text-xs font-semibold uppercase'
          style={{ color: '#6B6B6B', letterSpacing: '0.15em' }}
        >
          On this page
        </div>
        <ul className='space-y-2 border-l' style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          {blocks.map((b) => (
            <li key={b.id}>
              <a
                href={`#${b.id}`}
                className='-ml-px block border-l border-transparent pl-4 text-sm transition-colors hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                style={{ color: '#6B6B6B' }}
              >
                {b.heading}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Article body */}
      <article className='max-w-2xl'>
        <div
          className='mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium'
          style={{
            backgroundColor: 'rgba(0,0,0,0.06)',
            color: '#444',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          Effective {effectiveDate}
        </div>

        <p
          className='mb-12 text-base leading-relaxed'
          style={{ color: '#6B6B6B' }}
        >
          {intro}
        </p>

        {blocks.map((b) => (
          <section key={b.id} id={b.id} className='mb-12 scroll-mt-24'>
            <h2
              className='mb-4 text-2xl font-black'
              style={{
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.03em',
                color: '#0A0A0A',
              }}
            >
              {b.heading}
            </h2>
            {b.paragraphs.map((p, i) => (
              <p
                key={i}
                className='mb-4 text-sm leading-relaxed'
                style={{ color: '#6B6B6B' }}
              >
                {p}
              </p>
            ))}
            {b.list && (
              <ul className='mt-4 space-y-2'>
                {b.list.map((item) => (
                  <li
                    key={item}
                    className='flex items-start gap-2 text-sm leading-relaxed'
                    style={{ color: '#6B6B6B' }}
                  >
                    <span
                      className='mt-2 inline-block h-1 w-1 shrink-0 rounded-full'
                      style={{ backgroundColor: '#0A0A0A' }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div
          className='mt-16 rounded-xl border p-6'
          style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'white' }}
        >
          <h3
            className='mb-2 text-base font-bold'
            style={{ fontFamily: 'var(--font-heading)', color: '#0A0A0A' }}
          >
            Questions?
          </h3>
          <p className='text-sm leading-relaxed' style={{ color: '#6B6B6B' }}>
            Reach our legal team at{' '}
            <a
              href={`mailto:${contactEmail}`}
              className='font-medium underline'
              style={{ color: '#0A0A0A' }}
            >
              {contactEmail}
            </a>
            . We aim to reply within five business days.
          </p>
        </div>
      </article>
    </div>
  </section>
);
