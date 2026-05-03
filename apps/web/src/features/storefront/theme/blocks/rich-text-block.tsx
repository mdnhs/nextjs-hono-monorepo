import type { ThemeBlock } from '../types';

interface Settings {
  body?: string;
}

export function RichTextBlock({ block }: { block: ThemeBlock }) {
  const s = block.settings as Settings;
  if (!s.body) return null;
  return <p className="leading-relaxed text-muted-foreground">{s.body}</p>;
}
