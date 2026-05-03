import type { ThemeBlock } from '../types';

interface Settings {
  text?: string;
  level?: 1 | 2 | 3 | 4;
}

export function HeadingBlock({ block }: { block: ThemeBlock }) {
  const s = block.settings as Settings;
  const level = s.level ?? 2;
  const Tag = (`h${level}` as unknown) as keyof JSX.IntrinsicElements;
  const cls =
    level === 1 ? 'text-4xl font-bold' : level === 2 ? 'text-2xl font-semibold' : level === 3 ? 'text-xl font-medium' : 'text-lg';
  return <Tag className={`font-heading ${cls}`}>{s.text ?? ''}</Tag>;
}
