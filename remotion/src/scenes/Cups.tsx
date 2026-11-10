import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

/** Iced matcha latte in a clear cup, flat 2D, thick outline to match Mak. */
export const Cup: React.FC<{ size?: number; wobble?: boolean }> = ({ size = 200, wobble }) => {
  const frame = useCurrentFrame();
  const rot = wobble ? Math.sin(frame / 3) * 8 * Math.max(0, 1 - frame / 90) + Math.sin(frame / 5) * 2 : 0;
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={{ transform: `rotate(${rot}deg)`, transformOrigin: '50% 100%' }}>
      <rect x="62" y="0" width="7" height="45" rx="3" fill={C.pink} stroke={C.ink} strokeWidth="3" transform="rotate(12 65 22)" />
      <path d="M14 30 L86 30 L78 124 L22 124 Z" fill="#F4FBFF" stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      <path d="M18 62 L82 62 L78 120 L22 120 Z" fill={C.matcha} />
      <path d="M17 48 L83 48 L82 62 L18 62 Z" fill={C.matchaFoam} />
      <rect x="10" y="22" width="80" height="10" rx="5" fill="#F4FBFF" stroke={C.ink} strokeWidth="4" />
    </svg>
  );
};

export const CupsGrid: React.FC<{ count: number; cols?: number; size?: number; delay?: number }> = ({
  count,
  cols = 5,
  size = 120,
  delay = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: 16, justifyContent: 'center' }}>
      {Array.from({ length: count }, (_, i) => {
        const s = spring({ frame: frame - delay - i * 2, fps, config: { damping: 12 } });
        return (
          <div key={i} style={{ transform: `scale(${s})` }}>
            <Cup size={size * 0.75} />
          </div>
        );
      })}
    </div>
  );
};

export const Jar: React.FC<{ size?: number }> = ({ size = 260 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120">
    <rect x="22" y="4" width="56" height="18" rx="4" fill={C.purple} stroke={C.ink} strokeWidth="4" />
    <path d="M14 26 Q14 20 22 20 L78 20 Q86 20 86 26 L86 108 Q86 116 78 116 L22 116 Q14 116 14 108 Z" fill="#F4FBFF" stroke={C.ink} strokeWidth="4" />
    <path d="M18 50 L82 50 L82 106 Q82 112 76 112 L24 112 Q18 112 18 106 Z" fill={C.matchaDark} />
    <rect x="26" y="62" width="48" height="30" rx="4" fill={C.bg} stroke={C.ink} strokeWidth="3" />
    <circle cx="50" cy="77" r="8" fill={C.matcha} stroke={C.ink} strokeWidth="2.5" />
  </svg>
);

export const CupsVsJar: React.FC<{ cups: number }> = ({ cups }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const jarIn = spring({ frame: frame - 18, fps, config: { damping: 12 } });
  const vs = interpolate(frame, [12, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
      <div style={{ textAlign: 'center' }}>
        <CupsGrid count={cups} cols={4} size={95} delay={0} />
        <div style={{ fontSize: 38, fontWeight: 700, marginTop: 10 }}>{cups} gelas di kafe</div>
      </div>
      <div style={{ fontSize: 64, fontWeight: 900, color: C.pink, opacity: vs }}>+</div>
      <div style={{ textAlign: 'center', transform: `scale(${jarIn})` }}>
        <Jar size={200} />
        <div style={{ fontSize: 38, fontWeight: 700, marginTop: 10 }}>sisanya seduh sendiri</div>
      </div>
    </div>
  );
};
