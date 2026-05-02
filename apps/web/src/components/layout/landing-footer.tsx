import Link from 'next/link';
import { LogoMark } from '@/components/layout/logo-mark';

const footerLinks = ['Features', 'Pricing', 'Docs', 'Privacy', 'Terms'] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-black/[0.08] dark:border-white/[0.08]">
      <div className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5 text-foreground">
          <LogoMark />
          <span
            className="text-sm font-semibold"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
          >
            Shoply
          </span>
        </div>

        <nav className="flex items-center gap-6 flex-wrap">
          {footerLinks.map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-xs transition-colors text-muted-foreground hover:text-foreground"
            >
              {item}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Shoply. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
