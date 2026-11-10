import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

export const Ticket: React.FC<{ text: string; delay?: number }> = ({ text, delay = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13 } });
  const x = interpolate(s, [0, 1], [900, 0]);
  return (
    <div
      style={{
        transform: `translateX(${x}px) rotate(-4deg)`,
        display: 'flex',
        alignItems: 'stretch',
        background: C.white,
        border: `5px solid ${C.ink}`,
        borderRadius: 28,
        overflow: 'hidden',
        width: 820,
        margin: '0 auto',
      }}
    >
      <div style={{ background: C.red, width: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="90" height="90" viewBox="0 0 24 24" fill={C.white}>
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
        </svg>
      </div>
      <div style={{ padding: '26px 34px', flex: 1, borderLeft: `5px dashed ${C.ink}` }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: 4 }}>BOARDING PASS</div>
        <div style={{ fontSize: 56, fontWeight: 900, whiteSpace: 'nowrap' }}>{text}</div>
      </div>
    </div>
  );
};
