export type Status = 'draft' | 'generated' | 'qa_passed' | 'approved';

export type InfoItem =
  | { kind: 'cup'; wobble?: boolean }
  | { kind: 'counter'; to: number; display: string; label?: string }
  | { kind: 'cups'; count: number }
  | { kind: 'cups_vs_jar'; cups: number }
  | { kind: 'nametag'; text: string }
  | { kind: 'line'; text: string }
  | { kind: 'ticket'; text: string }
  | { kind: 'strike'; from: string; to: string; rest: string }
  | { kind: 'tip'; text: string }
  | { kind: 'tagline'; text: string }
  | { kind: 'comment_prompt'; text: string }
  | { kind: 'fineprint'; text: string };

export type CharTiming = { char: string; start: number; end: number };
export type Words = { text: string; duration: number; characters: CharTiming[] };

export type Scene = {
  id: string;
  type: 'infographic' | 'mak_beat';
  layout?: string;
  duration_s: number;
  line?: string;
  emotion?: string;
  action?: string;
  method?: 'frames' | 'i2v';
  frames?: string;
  frame_count?: number;
  fps_anim?: number;
  mouth?: { x: number; y: number; scale: number };
  clip?: string;
  vo?: { file: string; words: string };
  overlay?: string[];
  infographic?: InfoItem[];
  status: Status;
};

export type EpisodeData = {
  episode: string;
  title?: string;
  fps: number;
  size: [number, number];
  budget_usd: number;
  scenes: Scene[];
};

/** A scene after calculateMetadata: timing in frames and what assets loaded. */
export type ResolvedScene = Scene & {
  from: number;
  durationInFrames: number;
  showMak: boolean; // false → grey placeholder
  voAvailable: boolean;
  words: Words | null;
};

export type EpisodeProps = {
  episode: string;
  /** Show Mak beats that are generated but not yet approved (preview only). */
  previewUnapproved: boolean;
  resolved?: ResolvedScene[];
};
