import type { ThemeBlock } from '../types';

interface Settings {
  label?: string;
  href?: string;
  variant?: 'primary' | 'secondary';
}

export function ButtonBlock({ block }: { block: ThemeBlock }) {
  const s = block.settings as Settings;
  if (!s.label || !s.href) return null;
  const cls =
    s.variant === 'secondary'
      ? 'bg-secondary text-secondary-foreground'
      : 'bg-primary text-primary-foreground';
  return (
    <a href={s.href} className={`inline-flex items-center rounded-md px-4 py-2 font-medium ${cls}`}>
      {s.label}
    </a>
  );
}
