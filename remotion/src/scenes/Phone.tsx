import { C } from '../theme';

/**
 * A phone's screen content, drawn by Remotion so every number and word is exact.
 * When Mak's drawing has a blank phone, this fills its `screen` anchor; otherwise a
 * whole phone is drawn at her hand.
 */
export const PhoneScreen: React.FC<{ width: number; height: number; children: React.ReactNode; withBody?: boolean }> = ({
  width,
  height,
  children,
  withBody,
}) => (
  <div
    style={{
      width,
      height,
      background: C.white,
      borderRadius: withBody ? 46 : 18,
      border: withBody ? `16px solid ${C.ink}` : `3px solid ${C.ink}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ background: C.purple, color: C.white, fontSize: 26, fontWeight: 800, padding: '10px 18px' }}>Mutasi rekening</div>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>{children}</div>
  </div>
);
