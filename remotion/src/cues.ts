import type { Cue, ResolvedScene } from './types';

const norm = (w: string) => w.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]/gu, '');

/**
 * Seconds from scene start for a cue. With voiceover timings, `at_word` lands on
 * the exact moment the word starts; before the voiceover exists it is estimated
 * from the word's position in the line, so layouts can be previewed early.
 */
export function cueSeconds(cue: Cue | undefined, scene: ResolvedScene): number {
  if (!cue) return 0;
  if (cue.at_word) {
    const [raw, nth] = cue.at_word.split('#');
    const target = norm(raw);
    const want = Math.max(1, Number(nth ?? 1));
    const timed = scene.words?.words;
    if (timed?.length) {
      let seen = 0;
      for (const w of timed) {
        if (norm(w.word) === target && ++seen === want) return w.start + (cue.at ?? 0);
      }
    }
    const line = (scene.line ?? '').split(/\s+/).map(norm).filter(Boolean);
    let seen = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === target && ++seen === want) {
        const spoken = scene.duration_s * 0.85;
        return 0.15 + (i / Math.max(line.length, 1)) * spoken + (cue.at ?? 0);
      }
    }
    return cue.at ?? 0;
  }
  return cue.at ?? 0;
}

export const cueFrame = (cue: Cue | undefined, scene: ResolvedScene, fps: number) =>
  Math.round(cueSeconds(cue, scene) * fps);
