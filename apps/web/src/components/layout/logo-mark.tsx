export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="0" y="0" width="13" height="13" fill="currentColor" />
      <rect x="15" y="0" width="13" height="13" fill="currentColor" opacity="0.3" />
      <rect x="0" y="15" width="13" height="13" fill="currentColor" opacity="0.3" />
      <rect x="15" y="15" width="13" height="13" fill="currentColor" />
    </svg>
  );
}
