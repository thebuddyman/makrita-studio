import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { MakCharacter } from './MakCharacter';
import { SceneLayout, SceneOverlays } from './scenes';
import { C, fontFamily } from './theme';
import type { EpisodeProps } from './types';

/** Lays out every scene from scenes.json on one timeline. Remotion only reads scenes.json. */
export const Episode: React.FC<EpisodeProps> = ({ episode, resolved = [] }) => {
  const base = `episodes/${episode}`;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily, color: C.ink }}>
      {resolved.map((scene) => (
        <Sequence
          key={scene.id}
          name={`${scene.id} · ${scene.status}`}
          from={scene.from}
          durationInFrames={scene.durationInFrames}
        >
          <SceneLayout scene={scene} />
          {scene.type === 'mak_beat' ? <MakCharacter scene={scene} base={base} /> : null}
          <SceneOverlays scene={scene} />
          {scene.vo && scene.voAvailable ? <Audio src={staticFile(`${base}/${scene.vo.file}`)} /> : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
