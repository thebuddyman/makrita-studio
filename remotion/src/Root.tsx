import { CalculateMetadataFunction, Composition, staticFile } from 'remotion';
import { Episode } from './Episode';
import type { EpisodeData, EpisodeProps, ResolvedScene, Words } from './types';

const READY_FOR_PREVIEW = new Set(['generated', 'qa_passed', 'approved']);

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(staticFile(path));
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

const calculateMetadata: CalculateMetadataFunction<EpisodeProps> = async ({ props }) => {
  const base = `episodes/${props.episode}`;
  const data = await fetchJson<EpisodeData>(`${base}/scenes.json`);
  if (!data) {
    throw new Error(`episodes/${props.episode}/scenes.json not found — run "npm run sync" in remotion/`);
  }
  // written by scripts/sync-public.mjs
  const files = new Set((await fetchJson<string[]>(`${base}/manifest.json`)) ?? []);
  const exists = async (path: string) => files.has(path.slice(base.length + 1));

  let from = 0;
  const resolved: ResolvedScene[] = [];
  for (const s of data.scenes) {
    const durationInFrames = Math.round(s.duration_s * data.fps);
    const voAvailable = s.vo ? await exists(`${base}/${s.vo.file}`) : false;
    const words = s.vo && voAvailable ? await fetchJson<Words>(`${base}/${s.vo.words}`) : null;
    const showMak =
      s.type === 'mak_beat' &&
      (s.status === 'approved' || (props.previewUnapproved && READY_FOR_PREVIEW.has(s.status)));
    resolved.push({ ...s, from, durationInFrames, showMak, voAvailable, words });
    from += durationInFrames;
  }

  return {
    durationInFrames: Math.max(from, 1),
    fps: data.fps,
    width: data.size[0],
    height: data.size[1],
    props: { ...props, resolved },
  };
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Episode"
    component={Episode}
    durationInFrames={1140}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{ episode: '001-matcha', previewUnapproved: false } satisfies EpisodeProps}
    calculateMetadata={calculateMetadata}
  />
);
