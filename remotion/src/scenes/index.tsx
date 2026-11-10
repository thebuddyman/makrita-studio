import { AbsoluteFill, Freeze, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { cueFrame } from '../cues';
import { anchorPoint, makBox, poseAt, slotRect } from '../stage';
import { C } from '../theme';
import type { InfoContent, InfoItem, ResolvedScene, Slot } from '../types';
import { Counter } from './Counter';
import { Cup, CupsGrid, CupsVsJar } from './Cups';
import { FULL_FRAME_FX, FX } from './FX';
import { PhoneScreen } from './Phone';
import { Strike } from './Pun';
import { CommentPrompt, FinePrint, LineReveal, NameTag, Tagline, Tip } from './Text';
import { Ticket } from './Ticket';

type Size = Slot | 'phone';

/** One piece of infographic content, sized for where it sits. Starts at its own frame 0. */
const Content: React.FC<{ item: InfoContent; size: Size }> = ({ item, size }) => {
  const k = size === 'full' ? 1.3 : size === 'side' ? 0.78 : size === 'phone' ? 0.45 : size === 'front' ? 0.9 : 1;
  switch (item.kind) {
    case 'cup':
      return <Cup size={320 * k} wobble={item.wobble} />;
    case 'counter':
      return <Counter to={item.to} display={item.display} label={item.label} delay={0} size={150 * k} />;
    case 'cups':
      return <CupsGrid count={item.count} cols={item.cols ?? (size === 'side' || size === 'phone' ? 4 : 5)} size={120 * k} delay={0} />;
    case 'cups_vs_jar':
      return <div style={{ transform: `scale(${k})` }}><CupsVsJar cups={item.cups} /></div>;
    case 'nametag':
      return <NameTag text={item.text} delay={0} />;
    case 'line':
      return <LineReveal text={item.text} delay={0} />;
    case 'ticket':
      return <div style={{ transform: `scale(${Math.min(k, 1)})` }}><Ticket text={item.text} delay={0} /></div>;
    case 'strike':
      return <div style={{ transform: `scale(${k})` }}><Strike from={item.from} to={item.to} rest={item.rest} /></div>;
    case 'tip':
      return <Tip text={item.text} delay={0} />;
    case 'tagline':
      return <Tagline text={item.text} delay={0} />;
    case 'comment_prompt':
      return <CommentPrompt text={item.text} delay={0} />;
    case 'fineprint':
      return <FinePrint text={item.text} />;
    case 'phone':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          {item.screen.map((s, i) => (
            <Content key={i} item={s} size="phone" />
          ))}
        </div>
      );
    case 'fx':
      return <FX fx={item.fx} />;
  }
};

const FX_DUR: Record<string, number> = { impact: 0.6, shock: 0.6, speedlines: 0.9, sparkle: 1.4 };

/**
 * Shows `children` from the item's cue (a spoken word) until its `until` cue.
 * Before/after, an invisible settled copy keeps the slot's layout from jumping.
 */
const Timed: React.FC<{ item: InfoItem; scene: ResolvedScene; keepSpace: boolean; children: React.ReactNode }> = ({
  item,
  scene,
  keepSpace,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = cueFrame(item, scene, fps);
  // short accents (impact, shock…) end on their own; sweat/anger/redglow stay for the scene
  const fxDur = item.kind === 'fx' ? item.dur ?? FX_DUR[item.fx] : undefined;
  const end = item.until ? cueFrame(item.until, scene, fps) : fxDur ? start + Math.round(fxDur * fps) : Infinity;
  if (frame >= start && frame < end) {
    return (
      <Sequence from={start} layout="none">
        {children}
      </Sequence>
    );
  }
  return keepSpace ? (
    <div style={{ visibility: 'hidden' }}>
      <Freeze frame={300}>{children}</Freeze>
    </div>
  ) : null;
};

const defaultLayer = (item: InfoItem): 'back' | 'front' =>
  item.layer ?? (item.anchor || item.pos || item.slot === 'front' || item.slot === 'bottom' || item.kind === 'fx' ? 'front' : 'back');

/** A phone in Mak's hand: fills the blank screen in her drawing, or draws a whole phone. */
const HeldPhone: React.FC<{ item: Extract<InfoItem, { kind: 'phone' }>; scene: ResolvedScene }> = ({ item, scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const box = makBox(scene);
  const screen = poseAt(scene, t).pose?.anchors?.screen;
  const content = <Content item={item} size="phone" />;
  if (screen && scene.showMak) {
    const w = screen.w * box.width;
    const h = screen.h * box.height;
    return (
      <div
        style={{
          position: 'absolute',
          left: box.left + screen.x * box.width - w / 2,
          top: box.top + screen.y * box.height - h / 2,
          transform: `rotate(${screen.rot ?? 0}deg)`,
        }}
      >
        <PhoneScreen width={w} height={h}>{content}</PhoneScreen>
      </div>
    );
  }
  const p = anchorPoint(scene, item.anchor ?? 'hand_r', t);
  return (
    <div style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%,-82%) rotate(-6deg)' }}>
      <PhoneScreen width={330} height={560} withBody>{content}</PhoneScreen>
    </div>
  );
};

const Anchored: React.FC<{ item: InfoItem; scene: ResolvedScene }> = ({ item, scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (item.kind === 'phone') return <HeldPhone item={item} scene={scene} />;
  if (item.kind === 'fx' && (FULL_FRAME_FX.has(item.fx) || (!item.anchor && !item.pos))) {
    return <AbsoluteFill><FX fx={item.fx} /></AbsoluteFill>;
  }
  const p = item.pos ? { x: item.pos[0], y: item.pos[1] } : anchorPoint(scene, item.anchor ?? 'head', frame / fps);
  return (
    <div style={{ position: 'absolute', left: p.x, top: p.y }}>
      {item.kind === 'fx' ? <Content item={item} size="front" /> : <div style={{ transform: 'translate(-50%,-50%)' }}><Content item={item} size="front" /></div>}
    </div>
  );
};

/** All infographics of one layer: slot items stacked per slot, anchored items placed on Mak. */
export const InfoLayer: React.FC<{ scene: ResolvedScene; layer: 'back' | 'front' }> = ({ scene, layer }) => {
  const stage = scene.type === 'mak_beat' ? scene.stage ?? 'center' : 'none';
  const items = (scene.infographic ?? []).filter((i) => defaultLayer(i) === layer);
  const placed = items.filter((i) => i.anchor || i.pos || i.kind === 'phone' || i.kind === 'fx');
  const slotted = items.filter((i) => !placed.includes(i));
  const slots = [...new Set(slotted.map((i) => i.slot ?? (stage === 'none' ? 'full' : 'top')))] as Slot[];

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {slots.map((slot) => {
        const r = slotRect(stage, slot);
        return (
          <div
            key={slot}
            style={{
              position: 'absolute',
              ...r,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: slot === 'full' ? 70 : 34,
            }}
          >
            {slotted
              .filter((i) => (i.slot ?? (stage === 'none' ? 'full' : 'top')) === slot)
              .map((i, n) => (
                <Timed key={n} item={i} scene={scene} keepSpace>
                  <Content item={i} size={slot} />
                </Timed>
              ))}
          </div>
        );
      })}
      {placed.map((i, n) => (
        <Timed key={`a${n}`} item={i} scene={scene} keepSpace={false}>
          <Anchored item={i} scene={scene} />
        </Timed>
      ))}
    </AbsoluteFill>
  );
};

/** Flat painted background plate (sets/<name>.png) or a flat colour. */
export const SceneBackground: React.FC<{ scene: ResolvedScene }> = ({ scene }) => {
  const set = scene.set;
  if (set && !set.startsWith('#') && scene.setAvailable) {
    return <Img src={staticFile(`sets/${set}.png`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return <AbsoluteFill style={{ background: set?.startsWith('#') ? set : C.bg }} />;
};

/**
 * TV-cartoon camera: snaps (4 frames) to a new zoom on a cue word instead of
 * gliding, and shakes on twos for impacts.
 */
export const Camera: React.FC<{ scene: ResolvedScene; children: React.ReactNode }> = ({ scene, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = scene.camera?.zoom ?? 1;
  const moves = (scene.camera?.moves ?? []).map((m) => ({ ...m, f: cueFrame(m, scene, fps) })).sort((a, b) => a.f - b.f);
  let zoom = base;
  let prev = base;
  let origin = { x: 540, y: 960 };
  let dx = 0;
  let dy = 0;
  for (const m of moves) {
    if (frame < m.f) break;
    if (m.zoom) {
      prev = zoom;
      zoom = interpolate(frame, [m.f, m.f + 4], [prev, m.zoom], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      if (frame >= m.f + 4) zoom = m.zoom;
    }
    if (m.focus && m.focus !== 'center' && scene.type === 'mak_beat') origin = anchorPoint(scene, m.focus, m.f / fps);
    const k = frame - m.f;
    if (m.shake && k < 12) {
      const tw = Math.floor(k / 2);
      const amp = m.shake * (1 - k / 12);
      dx = (random(`sx-${scene.id}-${m.f}-${tw}`) * 2 - 1) * amp;
      dy = (random(`sy-${scene.id}-${m.f}-${tw}`) * 2 - 1) * amp;
    }
  }
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${zoom})`, transformOrigin: `${origin.x}px ${origin.y}px` }}>
      {children}
    </AbsoluteFill>
  );
};
