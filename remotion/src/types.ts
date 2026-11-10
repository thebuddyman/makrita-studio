export type Status = 'draft' | 'generated' | 'qa_passed' | 'approved';

/** When something happens in a scene: seconds from scene start, or the moment a word is spoken. */
export type Cue = {
  at?: number;
  /** word from the voiceover line, case-insensitive; "kebun#2" = second time it's said */
  at_word?: string;
};

/** Where an infographic sits. Slots adapt to Mak's stage position. */
export type Slot = 'full' | 'top' | 'side' | 'front' | 'bottom';
/** Points on Mak, per pose (see Pose.anchors). */
export type AnchorName = 'mouth' | 'hand_r' | 'hand_l' | 'head' | 'screen';

type Placement = Cue & {
  slot?: Slot;
  /** follow a point on Mak instead of a slot */
  anchor?: AnchorName;
  /** absolute centre in px, overrides slot */
  pos?: [number, number];
  /** draw over Mak instead of behind her */
  layer?: 'back' | 'front';
  /** disappear at this cue */
  until?: Cue;
};

export type InfoContent =
  | { kind: 'cup'; wobble?: boolean }
  | { kind: 'counter'; to: number; display: string; label?: string }
  | { kind: 'cups'; count: number; cols?: number }
  | { kind: 'cups_vs_jar'; cups: number }
  | { kind: 'nametag'; text: string }
  | { kind: 'line'; text: string }
  | { kind: 'ticket'; text: string }
  | { kind: 'strike'; from: string; to: string; rest: string }
  | { kind: 'tip'; text: string }
  | { kind: 'tagline'; text: string }
  | { kind: 'comment_prompt'; text: string }
  | { kind: 'fineprint'; text: string }
  /** a phone Mak holds; Remotion draws the screen content (never the image model) */
  | { kind: 'phone'; screen: InfoContent[] }
  /** cartoon accents */
  | { kind: 'fx'; fx: 'impact' | 'speedlines' | 'sweat' | 'sparkle' | 'anger' | 'shock' | 'redglow'; dur?: number };

export type InfoItem = InfoContent & Placement;

export type Point = { x: number; y: number };
export type Anchors = {
  mouth?: { x: number; y: number; scale: number; flip?: boolean } | null;
  hand_r?: Point;
  hand_l?: Point;
  head?: Point;
  /** the blank phone screen in this drawing: centre, size (fractions of the box) and tilt */
  screen?: { x: number; y: number; w: number; h: number; rot?: number };
};

/** One key pose: a few in-between drawings played on twos, then the last one is held. */
export type Pose = Cue & {
  name: string;
  /** what the art-director draws */
  desc: string;
  /** drawings in order, relative to the scene's frames/ folder; last one is the hold */
  frames: string[];
  /** loop the drawings while the pose is held (waving, head shake, whisking) */
  cycle?: boolean;
  /** same as the hold drawing with eyes closed (optional) */
  blink?: string;
  /** art only: background colour keyed out (blue when the drawing has green in it) */
  key_color?: string;
  anchors?: Anchors;
};

export type CameraMove = Cue & { zoom?: number; shake?: number; focus?: AnchorName | 'center' };

export type Stage = 'none' | 'center' | 'present-left' | 'present-right' | 'closeup';

export type CharTiming = { char: string; start: number; end: number };
export type WordTiming = { word: string; start: number; end: number };
export type Words = { text: string; duration: number; words: WordTiming[]; characters: CharTiming[] };

export type Scene = {
  id: string;
  type: 'infographic' | 'mak_beat';
  duration_s: number;
  line?: string;
  emotion?: string;
  action?: string;
  /** where Mak stands; infographic slots arrange around her */
  stage?: Stage;
  /** background plate sets/<name>.png, or a colour like "#FFF4E0" */
  set?: string;
  camera?: { zoom?: number; moves?: CameraMove[] };
  method?: 'frames' | 'i2v';
  /** test plans: e.g. {"chatgpt": "frames", "kling": "i2v"} — resolved into `method` */
  method_by_plan?: Record<string, 'frames' | 'i2v'>;
  frames?: string;
  fps_anim?: number;
  idle?: 'still' | 'breathe';
  poses?: Pose[];
  clip?: string;
  vo?: { file: string; words: string };
  infographic?: InfoItem[];
  status: Status;
};

export type EpisodeData = {
  episode: string;
  /** active test plan (see test-plans/) */
  plan?: string;
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
  setAvailable: boolean;
  blinkAvailable: Record<string, boolean>;
  words: Words | null;
};

export type EpisodeProps = {
  episode: string;
  /** Show Mak beats that are generated but not yet approved (preview only). */
  previewUnapproved: boolean;
  /** render a specific test plan; defaults to scenes.json "plan" */
  plan?: string;
  resolved?: ResolvedScene[];
};
