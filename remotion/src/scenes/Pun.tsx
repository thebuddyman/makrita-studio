import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

/** "masa depan" → strike through "masa" → "matcha" drops in above it. */
export const Strike: React.FC<{ from: string; to: string; rest: string }> = ({ from, to, rest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = interpolate(frame, [20, 32], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const drop = spring({ frame: frame - 34, fps, config: { damping: 10 } });
  return (
    <div style={{ textAlign: 'center', fontSize: 140, fontWeight: 900, lineHeight: 1.05 }}>
      <div
        style={{
          color: C.matchaDark,
          transform: `translateY(${interpolate(drop, [0, 1], [-120, 0])}px) rotate(-5deg)`,
          opacity: drop,
          fontSize: 150,
        }}
      >
        {to}
      </div>
      <span style={{ position: 'relative', display: 'inline-block', color: C.muted }}>
        {from}
        <span
          style={{
            position: 'absolute',
            left: -10,
            top: '52%',
            height: 18,
            width: `calc(${line}% + 20px)`,
            background: C.red,
            borderRadius: 9,
          }}
        />
      </span>{' '}
      <span>{rest}</span>
    </div>
  );
};
