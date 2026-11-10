import { loadFont } from '@remotion/google-fonts/Figtree';

// Figtree is the Mak Rita app's only typeface.
export const { fontFamily } = loadFont('normal', {
  weights: ['500', '700', '800', '900'],
  subsets: ['latin'],
});

export const C = {
  bg: '#FFF4E0', // warm cream
  ink: '#1F1A2E',
  muted: '#6E6680',
  matcha: '#7DA453',
  matchaDark: '#4E7A2E',
  matchaFoam: '#CFE3A8',
  purple: '#6B4BC4', // Mak's batik daster
  purpleSoft: '#E6DEFA',
  pink: '#EC4F8C', // Mak's curlers
  red: '#E5484D',
  gold: '#F5B82E',
  white: '#FFFFFF',
  placeholder: '#B9B5C2',
};

export const W = 1080;
export const H = 1920;
/** Mak's box: half-body cut-out, bottom-anchored, square like the frame sheets. */
export const MAK_BOX = { width: 1080, height: 1080 };
/** Free area above Mak for infographics. */
export const INFO_TOP = { top: 120, height: H - MAK_BOX.height - 60 };
