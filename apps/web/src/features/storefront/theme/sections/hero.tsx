import Image from 'next/image';
import type { ThemeSection, RenderContext } from '../types';

interface HeroSettings {
  heading?: string;
  subheading?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: 'left' | 'center' | 'right';
}

export function HeroSection({ section }: { section: ThemeSection; ctx: RenderContext }) {
  const s = section.settings as HeroSettings;
  const align = s.align ?? 'center';
  const alignClass =
    align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';

  return (
    <section className="relative w-full overflow-hidden">
      {s.imageUrl && (
        <div className="absolute inset-0 -z-10">
          <Image src={s.imageUrl} alt="" fill className="object-cover opacity-40" priority />
        </div>
      )}
      <div className={`mx-auto flex max-w-5xl flex-col gap-4 px-6 py-24 ${alignClass}`}>
        {s.heading && <h1 className="font-heading text-4xl font-bold md:text-6xl">{s.heading}</h1>}
        {s.subheading && <p className="max-w-2xl text-lg text-muted-foreground">{s.subheading}</p>}
        {s.ctaLabel && s.ctaHref && (
          <a
            href={s.ctaHref}
            className="mt-2 inline-flex items-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground"
          >
            {s.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
