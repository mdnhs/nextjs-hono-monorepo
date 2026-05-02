import Link from 'next/link';
import { LogoMark } from '@/components/layout/logo-mark';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';

const navLinks = ['Features', 'Pricing', 'Docs'] as const;

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#F8F8F6]/85 dark:bg-[#0A0A0A]/85 backdrop-blur-md border-b border-black/[0.08] dark:border-white/[0.08]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <LogoMark />
          <span
            className="text-base font-semibold"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
          >
            Shoply
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-sm transition-colors text-muted-foreground hover:text-foreground"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />

          <div className="w-px h-5 bg-border mx-2" />

          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-lg transition-colors text-foreground hover:bg-foreground/5"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 rounded-lg font-medium transition-colors bg-foreground text-background hover:bg-foreground/90"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
