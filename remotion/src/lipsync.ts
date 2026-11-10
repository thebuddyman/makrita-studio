import type { Words } from './types';

export type Viseme = 'closed' | 'A' | 'E' | 'I' | 'O' | 'U' | 'FV' | 'MBP';
export const VISEMES: Viseme[] = ['closed', 'A', 'E', 'I', 'O', 'U', 'FV', 'MBP'];

/** Bahasa Indonesia is close to phonetic, so letters map to mouth shapes well. */
function visemeFor(ch: string): Viseme {
  const c = ch.toLowerCase();
  if ('a'.includes(c)) return 'A';
  if ('e'.includes(c)) return 'E';
  if ('iy'.includes(c)) return 'I';
  if ('o'.includes(c)) return 'O';
  if ('uw'.includes(c)) return 'U';
  if ('fv'.includes(c)) return 'FV';
  if ('mbp'.includes(c)) return 'MBP';
  if (/[a-z]/.test(c)) return 'E'; // other consonants: slightly open
  return 'closed'; // spaces, punctuation
}

/**
 * Mouth shape at time t (seconds into the scene). Holds each shape for at least
 * `minHold` s so the mouth doesn't flutter (2D cartoons animate mouths on twos).
 */
export function visemeAt(words: Words | null, t: number, minHold = 1 / 15): Viseme {
  if (!words) return 'closed';
  const chars = words.characters;
  // snap t to the hold grid so neighbouring frames agree
  const tq = Math.floor(t / minHold) * minHold;
  for (const c of chars) {
    if (tq >= c.start && tq < c.end) return visemeFor(c.char);
  }
  return 'closed';
}
