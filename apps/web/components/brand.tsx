import * as React from 'react';

export function SparklesIcon({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
      <path d="M19 14l.7 1.7L21.5 16l-1.8.6L19 18l-.7-1.4L16.5 16l1.8-.6L19 14z" />
    </svg>
  );
}

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: '#171717',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SparklesIcon size={size * 0.5} />
    </div>
  );
}

export function BrandLockup({ size = 32 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <BrandMark size={size} />
      <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>Lumen</span>
    </span>
  );
}

const PALETTES = [
  ['#fde68a', '#fda4af'], // amber → rose
  ['#bae6fd', '#c4b5fd'], // sky → violet
  ['#bbf7d0', '#a5f3fc'], // green → cyan
  ['#fecaca', '#fbcfe8'], // red → pink
  ['#fed7aa', '#fde68a'], // orange → amber
  ['#ddd6fe', '#fbcfe8'], // violet → pink
];

function paletteFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

export function GradientAvatar({
  name,
  src,
  size = 36,
  radius,
}: {
  name: string;
  src?: string | null;
  size?: number;
  radius?: number;
}) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const [a, b] = paletteFor(name || 'x');
  const r = radius ?? size / 2;
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{ borderRadius: r, objectFit: 'cover', display: 'block' }}
      />
    );
  }
  return (
    <div
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: `linear-gradient(135deg, ${a}, ${b})`,
        color: '#262626',
        fontWeight: 600,
        fontSize: size * 0.32,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initials || '·'}
    </div>
  );
}
