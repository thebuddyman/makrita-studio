import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { visemeAt } from './lipsync';
import { C, MAK_BOX } from './theme';
import type { ResolvedScene } from './types';

/**
 * Mak, half-body, bottom-anchored (never the old circle crop).
 *  - method "frames": plays the frame sheet at fps_anim (12 fps = "on twos") and
 *    overlays mouth shapes from the voiceover's timestamps.
 *  - method "i2v": plays the hero clip (WebM with alpha, already lip-synced).
 *  - not approved (or no assets): grey placeholder so timing can still be checked.
 */
export const MakCharacter: React.FC<{ scene: ResolvedScene; base: string }> = ({ scene, base }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const y = interpolate(enter, [0, 1], [80, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
      <div
        style={{
          position: 'relative',
          width: MAK_BOX.width,
          height: MAK_BOX.height,
          transform: `translateY(${y}px)`,
        }}
      >
        {scene.showMak ? <MakBody scene={scene} base={base} /> : <Placeholder scene={scene} />}
      </div>
    </AbsoluteFill>
  );
};

const MakBody: React.FC<{ scene: ResolvedScene; base: string }> = ({ scene, base }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (scene.method === 'i2v' && scene.clip) {
    return (
      <OffthreadVideo
        src={staticFile(`${base}/${scene.clip}`)}
        transparent
        muted
        style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom' }}
      />
    );
  }

  const count = Math.max(scene.frame_count ?? 1, 1);
  const animFps = scene.fps_anim ?? 12;
  const idx = (Math.floor((frame / fps) * animFps) % count) + 1;
  const src = staticFile(`${base}/${scene.frames ?? ''}${String(idx).padStart(3, '0')}.png`);
  const viseme = visemeAt(scene.words, frame / fps);
  const m = scene.mouth ?? { x: 0.5, y: 0.47, scale: 0.12 };
  const mouthSize = MAK_BOX.width * m.scale;

  return (
    <>
      <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      {scene.voAvailable ? (
        <Img
          src={staticFile(`character/mouth-shapes/${viseme}.png`)}
          style={{
            position: 'absolute',
            width: mouthSize,
            height: mouthSize,
            left: MAK_BOX.width * m.x - mouthSize / 2,
            top: MAK_BOX.height * m.y - mouthSize / 2,
          }}
        />
      ) : null}
    </>
  );
};

const Placeholder: React.FC<{ scene: ResolvedScene }> = ({ scene }) => (
  <div
    style={{
      position: 'absolute',
      left: 140,
      right: 140,
      bottom: 0,
      top: 120,
      borderRadius: '360px 360px 0 0',
      background: C.placeholder,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: C.white,
      textAlign: 'center',
      gap: 12,
      opacity: 0.9,
    }}
  >
    <div style={{ fontSize: 56, fontWeight: 800 }}>MAK</div>
    <div style={{ fontSize: 34, fontWeight: 700 }}>{scene.id}</div>
    <div style={{ fontSize: 30, fontWeight: 500, maxWidth: 640 }}>
      {scene.emotion} · {scene.action}
    </div>
    <div style={{ fontSize: 28, fontWeight: 500 }}>
      {scene.method} · {scene.status}
    </div>
  </div>
);
