import { Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { visemeAt } from './lipsync';
import { DEFAULT_ANCHORS, makBox, poseAt } from './stage';
import { C } from './theme';
import type { ResolvedScene } from './types';

/**
 * Mak, animated like a 2D TV cartoon:
 *  - pose-to-pose: each key pose plays its in-between drawings on twos (12 fps),
 *    then HOLDS the last drawing until the next pose's cue (a word in the voiceover)
 *  - a 2-frame squash and small overshoot on every pose change (anticipation/settle)
 *  - blinks on held poses, every ~3 s
 *  - mouth shapes from the voiceover timings, placed per pose
 *  - "i2v" scenes play the hero clip instead (already lip-synced)
 *  - unapproved scenes show a grey stand-in with the pose name, so timing and
 *    layout can be reviewed before any art exists
 */
export const MakCharacter: React.FC<{ scene: ResolvedScene; base: string }> = ({ scene, base }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = makBox(scene);
  const t = frame / fps;

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const { pose, start } = poseAt(scene, t);
  const sincePose = frame - Math.round(start * fps);
  // squash → stretch → settle on each new pose (not on the very first one)
  const sy = start > 0 ? interpolate(sincePose, [0, 2, 5, 9], [0.95, 1.03, 0.995, 1], { extrapolateRight: 'clamp' }) : 1;
  const sx = 2 - sy;
  const breathe = scene.idle === 'breathe' ? 1 + 0.006 * Math.sin((Math.floor(frame / 2) * 2 * Math.PI) / (fps * 3.2)) : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        transform: `translateY(${interpolate(enter, [0, 1], [90, 0])}px) scale(${sx}, ${sy * breathe})`,
        transformOrigin: '50% 100%',
      }}
    >
      {scene.showMak ? <MakBody scene={scene} base={base} /> : <Placeholder scene={scene} poseName={pose?.name} poseDesc={pose?.desc} />}
    </div>
  );
};

const MakBody: React.FC<{ scene: ResolvedScene; base: string }> = ({ scene, base }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = makBox(scene);
  const t = frame / fps;
  const dir = scene.frames ?? '';

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

  const { pose, start } = poseAt(scene, t);
  if (!pose || pose.frames.length === 0) return <Placeholder scene={scene} />;

  // in-betweens on twos, then hold the last drawing
  const animFps = scene.fps_anim ?? 12;
  const step = Math.floor((t - start) * animFps);
  const drawing = pose.cycle ? step % pose.frames.length : Math.min(step, pose.frames.length - 1);
  const holding = !pose.cycle && drawing === pose.frames.length - 1;
  let file = pose.frames[drawing];
  if (holding && pose.blink && scene.blinkAvailable[pose.blink]) {
    // blink for 3 frames roughly every 3 s, offset per scene so beats don't blink in sync
    const period = Math.round(fps * 3.1);
    const offset = (scene.id.length * 7) % period;
    if ((frame + offset) % period < 3) file = pose.blink;
  }

  const anchors = { ...DEFAULT_ANCHORS, ...(pose.anchors ?? {}) };
  const m = anchors.mouth;
  const speaking = scene.voAvailable && m;
  const mouthSize = m ? box.width * m.scale : 0;

  return (
    <>
      <Img src={staticFile(`${base}/${dir}${file}`)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      {speaking && m ? (
        <Img
          src={staticFile(`character/mouth-shapes/${visemeAt(scene.words, t)}.png`)}
          style={{
            position: 'absolute',
            width: mouthSize,
            height: mouthSize,
            left: box.width * m.x - mouthSize / 2,
            top: box.height * m.y - mouthSize / 2,
            transform: m.flip ? 'scaleX(-1)' : undefined,
          }}
        />
      ) : null}
    </>
  );
};

const Placeholder: React.FC<{ scene: ResolvedScene; poseName?: string; poseDesc?: string }> = ({ scene, poseName, poseDesc }) => (
  <div
    style={{
      position: 'absolute',
      left: '13%',
      right: '13%',
      bottom: 0,
      top: '11%',
      borderRadius: '50% 50% 0 0 / 38% 38% 0 0',
      background: C.placeholder,
      border: `6px solid ${C.ink}`,
      borderBottom: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: C.white,
      textAlign: 'center',
      gap: 10,
      padding: 40,
    }}
  >
    <div style={{ fontSize: 52, fontWeight: 900 }}>MAK · {poseName ?? scene.emotion}</div>
    <div style={{ fontSize: 30, fontWeight: 600, maxWidth: 620 }}>{poseDesc ?? scene.action}</div>
    <div style={{ fontSize: 26, fontWeight: 500, opacity: 0.85 }}>
      {scene.id} · {scene.method} · {scene.status}
    </div>
  </div>
);
