import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

export const RedGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.55 + Math.sin(frame / 4) * 0.15;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 70%, rgba(229,72,77,0) 35%, rgba(229,72,77,${pulse}) 100%)`,
      }}
    />
  );
};

/** Manga anger mark (💢 shape), drawn so it stays crisp and on-palette. */
export const AngerMark: React.FC<{ x?: number; y?: number; delay?: number }> = ({ x = 760, y = 900, delay = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 8 } });
  const throb = 1 + Math.sin(frame / 3) * 0.06;
  return (
    <svg
      width={200}
      height={200}
      viewBox="0 0 100 100"
      style={{ position: 'absolute', left: x, top: y, transform: `scale(${s * throb})`, opacity: interpolate(s, [0, 0.3], [0, 1]) }}
    >
      {[0, 90, 180, 270].map((r) => (
        <path
          key={r}
          d="M40 10 Q46 34 30 40 Q34 46 40 40 Q46 34 60 30"
          fill="none"
          stroke={C.red}
          strokeWidth="9"
          strokeLinecap="round"
          transform={`rotate(${r} 50 50)`}
        />
      ))}
    </svg>
  );
};
