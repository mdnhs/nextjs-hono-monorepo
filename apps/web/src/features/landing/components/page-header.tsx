interface PageHeaderProps {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  description: string;
}

export const PageHeader = ({ eyebrow, title, titleAccent, description }: PageHeaderProps) => (
  <section className='relative overflow-hidden' style={{ backgroundColor: '#F8F8F6' }}>
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

    <div className='relative mx-auto max-w-[1280px] px-6 pb-16 pt-24'>
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
          {eyebrow}
        </span>
      </div>

      <h1
        className='mb-6 max-w-3xl font-black leading-none'
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(44px, 7vw, 96px)',
          letterSpacing: '-0.04em',
          lineHeight: 0.95,
          color: '#0A0A0A',
        }}
      >
        {title}
        {titleAccent && (
          <>
            <br />
            <span style={{ color: '#9CA3AF' }}>{titleAccent}</span>
          </>
        )}
      </h1>

      <p
        className='max-w-xl text-lg leading-relaxed md:text-xl'
        style={{ color: '#6B6B6B' }}
      >
        {description}
      </p>
    </div>
  </section>
);
