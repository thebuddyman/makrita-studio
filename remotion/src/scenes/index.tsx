import { AbsoluteFill } from 'remotion';
import { C, INFO_TOP } from '../theme';
import type { InfoItem, ResolvedScene } from '../types';
import { Counter } from './Counter';
import { Cup, CupsGrid, CupsVsJar } from './Cups';
import { AngerMark, RedGlow } from './Overlays';
import { Strike } from './Pun';
import { CommentPrompt, FinePrint, LineReveal, NameTag, Tagline, Tip } from './Text';
import { Ticket } from './Ticket';

/** One infographic item from scenes.json → component. `i` staggers entrances. */
const Item: React.FC<{ item: InfoItem; i: number; big?: boolean }> = ({ item, i, big }) => {
  const delay = 4 + i * 14;
  switch (item.kind) {
    case 'cup':
      return <Cup size={big ? 420 : 220} wobble={item.wobble} />;
    case 'counter':
      return <Counter to={item.to} display={item.display} label={item.label} delay={delay} size={big ? 190 : 140} />;
    case 'cups':
      return <CupsGrid count={item.count} delay={delay} />;
    case 'cups_vs_jar':
      return <CupsVsJar cups={item.cups} />;
    case 'nametag':
      return <NameTag text={item.text} delay={delay} />;
    case 'line':
      return <LineReveal text={item.text} delay={delay + 10} />;
    case 'ticket':
      return <Ticket text={item.text} delay={delay + 16} />;
    case 'strike':
      return <Strike from={item.from} to={item.to} rest={item.rest} />;
    case 'tip':
      return <Tip text={item.text} delay={delay + 40} />;
    case 'tagline':
      return <Tagline text={item.text} delay={delay} />;
    case 'comment_prompt':
      return <CommentPrompt text={item.text} delay={delay + 20} />;
    case 'fineprint':
      return <FinePrint text={item.text} />;
  }
};

const Stack: React.FC<{ items: InfoItem[]; top?: number; height?: number; big?: boolean; gap?: number }> = ({
  items,
  top = INFO_TOP.top,
  height = INFO_TOP.height,
  big,
  gap = 40,
}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: 0,
      right: 0,
      height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap,
    }}
  >
    {items.map((item, i) => (
      <Item key={i} item={item} i={i} big={big} />
    ))}
  </div>
);

/** Background + infographics, drawn under Mak. */
export const SceneLayout: React.FC<{ scene: ResolvedScene }> = ({ scene }) => {
  const items = scene.infographic ?? [];
  switch (scene.layout) {
    case 'Hook':
      // full screen, no Mak: the shocking number up front
      return (
        <AbsoluteFill style={{ background: C.bg }}>
          <Stack items={items} top={0} height={1920} big gap={70} />
        </AbsoluteFill>
      );
    case 'Marah':
      return (
        <AbsoluteFill style={{ background: '#FFE3E0' }}>
          <RedGlow />
          <Stack items={items} />
        </AbsoluteFill>
      );
    case 'Punchline': {
      const fine = items.filter((i) => i.kind === 'fineprint');
      const rest = items.filter((i) => i.kind !== 'fineprint');
      return (
        <AbsoluteFill style={{ background: C.purpleSoft }}>
          <Stack items={rest} />
          <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, zIndex: 10 }}>
            {fine.map((item, i) => (
              <Item key={i} item={item} i={i} />
            ))}
          </div>
        </AbsoluteFill>
      );
    }
    default:
      return (
        <AbsoluteFill style={{ background: C.bg }}>
          <Stack items={items} />
        </AbsoluteFill>
      );
  }
};

/** Effects drawn over Mak (scenes.json `overlay`). */
export const SceneOverlays: React.FC<{ scene: ResolvedScene }> = ({ scene }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {scene.overlay?.includes('anger') ? <AngerMark /> : null}
  </AbsoluteFill>
);
