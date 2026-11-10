import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { MakCharacter } from './MakCharacter';
import { Camera, InfoLayer, SceneBackground } from './scenes';
import { C, fontFamily } from './theme';
import type { EpisodeProps } from './types';

/**
 * Lays out every scene from scenes.json on one timeline. Remotion only reads scenes.json.
 * Per scene, back to front: set → graphics behind Mak → Mak → graphics/FX in front,
 * all inside one camera so push-ins and shakes move everything together.
 */
export const Episode: React.FC<EpisodeProps> = ({ episode, resolved = [] }) => {
  const base = `episodes/${episode}`;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily, color: C.ink }}>
      {resolved.map((scene) => (
        <Sequence key={scene.id} name={`${scene.id} · ${scene.status}`} from={scene.from} durationInFrames={scene.durationInFrames}>
          <Camera scene={scene}>
            <SceneBackground scene={scene} />
            <InfoLayer scene={scene} layer="back" />
            {scene.type === 'mak_beat' ? <MakCharacter scene={scene} base={base} /> : null}
            <InfoLayer scene={scene} layer="front" />
          </Camera>
          {scene.vo && scene.voAvailable ? <Audio src={staticFile(`${base}/${scene.vo.file}`)} /> : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
