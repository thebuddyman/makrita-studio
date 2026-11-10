import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { C } from '../theme';
import { AngerMark, RedGlow } from './Overlays';

/**
 * TV-cartoon accents. Everything here animates on twos (Math.floor(frame / 2))
 * so it matches Mak's drawings instead of looking like smooth motion graphics.
 */
const useTwos = () => Math.floor(useCurrentFrame() / 2) * 2;

/** Jagged "POW" star behind an impact (table slam). */
export const Impact: React.FC<{ size?: number }> = ({ size = 520 }) => {
  const f = useTwos();
  const s = interpolate(f, [0, 2, 8, 14], [0.4, 1.15, 1, 0], { extrapolateRight: 'clamp' });
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 0.55 : 0.95 + random(`impact-${i}`) * 0.12;
    return `${50 + Math.cos(a) * 50 * r},${50 + Math.sin(a) * 50 * r}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `translate(-50%,-50%) scale(${s})`, position: 'absolute' }}>
      <polygon points={pts} fill={C.gold} stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points={pts} fill={C.white} transform="translate(50 50) scale(0.55) translate(-50 -50)" />
    </svg>
  );
};

/** Radial speed lines that flicker on twos — for shouts and big reveals. */
export const SpeedLines: React.FC = () => {
  const f = useTwos();
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2 + random(`sl-${i}-${f}`) * 0.08;
          const r0 = 520 + random(`r0-${i}-${f}`) * 160;
          const cx = 540;
          const cy = 1100;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r0}
              y1={cy + Math.sin(a) * r0}
              x2={cx + Math.cos(a) * 1600}
              y2={cy + Math.sin(a) * 1600}
              stroke={C.ink}
              strokeWidth={3 + random(`w-${i}`) * 7}
              opacity={0.85}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Sweat drop that slides down (nervous / caught out). */
export const Sweat: React.FC = () => {
  const f = useTwos();
  const y = interpolate(f, [0, 20], [0, 40], { extrapolateRight: 'clamp' });
  return (
    <svg width="80" height="110" viewBox="0 0 40 55" style={{ position: 'absolute', transform: `translate(-50%, ${-50 + y}%)` }}>
      <path d="M20 2 C26 18 36 28 36 38 A16 16 0 0 1 4 38 C4 28 14 18 20 2 Z" fill="#8FD3FF" stroke={C.ink} strokeWidth="3" />
      <ellipse cx="14" cy="36" rx="3" ry="6" fill={C.white} />
    </svg>
  );
};

/** Sparkles around a reveal (the pun, the saving). */
export const Sparkle: React.FC = () => {
  const f = useTwos();
  return (
    <div style={{ position: 'absolute', transform: 'translate(-50%,-50%)', width: 360, height: 260 }}>
      {[0, 1, 2, 3].map((i) => {
        const on = (f / 2 + i) % 4 < 2;
        const x = [20, 300, 60, 260][i];
        const y = [30, 10, 200, 190][i];
        return (
          <svg key={i} width="60" height="60" viewBox="0 0 20 20" style={{ position: 'absolute', left: x, top: y, transform: `scale(${on ? 1 : 0.5})` }}>
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill={C.gold} stroke={C.ink} strokeWidth="1.2" />
          </svg>
        );
      })}
    </div>
  );
};

/** Short shock lines around the head (a "take"). */
export const Shock: React.FC = () => {
  const f = useTwos();
  const s = interpolate(f, [0, 2, 6], [0.6, 1.1, 1], { extrapolateRight: 'clamp' });
  return (
    <svg width="420" height="200" viewBox="0 0 210 100" style={{ position: 'absolute', transform: `translate(-50%,-80%) scale(${s})` }}>
      {[[20, 70, 45, 50], [40, 30, 62, 32], [105, 8, 105, 30], [170, 30, 148, 32], [190, 70, 165, 50]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
      ))}
    </svg>
  );
};

/** Effects that cover the whole frame rather than sitting at a point. */
export const FULL_FRAME_FX = new Set(['speedlines', 'redglow']);

export const FX: React.FC<{ fx: string }> = ({ fx }) => {
  switch (fx) {
    case 'impact':
      return <Impact />;
    case 'speedlines':
      return <SpeedLines />;
    case 'sweat':
      return <Sweat />;
    case 'sparkle':
      return <Sparkle />;
    case 'shock':
      return <Shock />;
    case 'anger':
      return <div style={{ position: 'absolute', transform: 'translate(-50%,-50%)' }}><AngerMark x={-100} y={-100} delay={0} /></div>;
    case 'redglow':
      return <RedGlow />;
    default:
      return null;
  }
};
