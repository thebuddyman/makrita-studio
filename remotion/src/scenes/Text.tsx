import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

const useIn = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14 } });
};

export const NameTag: React.FC<{ text: string; delay?: number }> = ({ text, delay = 4 }) => {
  const s = useIn(delay);
  return (
    <div style={{ textAlign: 'center', transform: `scale(${s}) rotate(-3deg)` }}>
      <div style={{ display: 'inline-block', background: C.purple, color: C.white, border: `6px solid ${C.ink}`, borderRadius: 26, padding: '14px 44px' }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 6, opacity: 0.85 }}>KENALIN</div>
        <div style={{ fontSize: 110, fontWeight: 900, lineHeight: 1 }}>{text}</div>
      </div>
    </div>
  );
};

/** Wipes the line in from left to right. */
export const LineReveal: React.FC<{ text: string; delay?: number }> = ({ text, delay = 30 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 18], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ textAlign: 'center', fontSize: 58, fontWeight: 800, clipPath: `inset(0 ${100 - p}% 0 0)`, padding: '0 60px' }}>
      {text}
    </div>
  );
};

export const Tip: React.FC<{ text: string; delay?: number }> = ({ text, delay = 60 }) => {
  const s = useIn(delay);
  return (
    <div style={{ textAlign: 'center', transform: `scale(${s})` }}>
      <span style={{ display: 'inline-block', background: C.matchaFoam, border: `5px solid ${C.ink}`, borderRadius: 999, padding: '16px 40px', fontSize: 44, fontWeight: 800 }}>
        💡 {text}
      </span>
    </div>
  );
};

export const Tagline: React.FC<{ text: string; delay?: number }> = ({ text, delay = 6 }) => {
  const s = useIn(delay);
  return (
    <div style={{ textAlign: 'center', fontSize: 84, fontWeight: 900, lineHeight: 1.05, padding: '0 60px', transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`, opacity: s }}>
      {text}
    </div>
  );
};

export const CommentPrompt: React.FC<{ text: string; delay?: number }> = ({ text, delay = 40 }) => {
  const s = useIn(delay);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', transform: `scale(${s})` }}>
      <div style={{ background: C.white, border: `5px solid ${C.ink}`, borderRadius: 32, padding: '22px 36px', maxWidth: 860, display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ fontSize: 60 }}>💬</div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>{text}</div>
      </div>
    </div>
  );
};

export const FinePrint: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 500, color: C.muted, padding: '0 80px' }}>*{text}</div>
);
