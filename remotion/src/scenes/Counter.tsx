import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

/** Formats a running value in the same unit and decimals as the final display (Rp10,8 jt). */
function formatLike(display: string, value: number): string {
  const m = display.match(/Rp\s?([\d.,]+)\s?(rb|jt)?/i);
  if (!m) return display;
  const unit = (m[2] ?? '').toLowerCase();
  const decimals = (m[1].split(',')[1] ?? '').length;
  const div = unit === 'jt' ? 1e6 : unit === 'rb' ? 1e3 : 1;
  const n = (value / div).toFixed(decimals).replace('.', ',');
  return `Rp${n}${unit ? ` ${unit}` : ''}`;
}

export const Counter: React.FC<{
  to: number;
  display: string;
  label?: string;
  delay?: number;
  size?: number;
  color?: string;
}> = ({ to, display, label, delay = 6, size = 150, color = C.ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.round(fps * 1.2);
  const p = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const text = p >= 1 ? display : formatLike(display, to * p);
  const pop = p >= 1 ? interpolate(frame - delay - dur, [0, 4, 10], [1, 1.08, 1], { extrapolateRight: 'clamp' }) : 1;

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: size,
          fontWeight: 900,
          color,
          letterSpacing: -2,
          transform: `scale(${pop})`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {text}
      </div>
      {label ? <div style={{ fontSize: 40, fontWeight: 600, color: C.muted, marginTop: 4 }}>{label}</div> : null}
    </div>
  );
};
