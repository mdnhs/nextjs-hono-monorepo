import { cn } from '@/lib/utils';

const PALETTES = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

function colorIndex(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % PALETTES.length;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0] ?? '').slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return (first + last).toUpperCase();
}

interface InitialAvatarProps {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function InitialAvatar({ name, size = 'sm', className }: InitialAvatarProps) {
  const palette = PALETTES[colorIndex(name)];
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', sizeClass, palette, className)}>
      {initials(name)}
    </div>
  );
}
