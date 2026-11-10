import { cueSeconds } from './cues';
import type { AnchorName, Anchors, Pose, ResolvedScene, Slot, Stage } from './types';

export type Rect = { left: number; top: number; width: number; height: number };

/**
 * Mak's box per stage (frame drawings are square, half-body, bottom-anchored).
 * "present" stages push her to one side so she can point at the graphics.
 */
export const STAGE_BOX: Record<Exclude<Stage, 'none'>, Rect> = {
  center: { left: 0, top: 840, width: 1080, height: 1080 },
  'present-right': { left: 300, top: 1000, width: 920, height: 920 },
  'present-left': { left: -140, top: 1000, width: 920, height: 920 },
  closeup: { left: -240, top: 560, width: 1560, height: 1560 },
};

/** Where each slot is for a given stage, in px of the 1080×1920 frame. */
export function slotRect(stage: Stage, slot: Slot): Rect {
  const full = { left: 0, top: 0, width: 1080, height: 1920 };
  if (slot === 'full' || stage === 'none') return slot === 'bottom' ? { left: 0, top: 1760, width: 1080, height: 140 } : full;
  if (slot === 'bottom') return { left: 0, top: 1800, width: 1080, height: 100 };
  switch (stage) {
    case 'center':
      return slot === 'front'
        ? { left: 60, top: 1380, width: 960, height: 360 }
        : { left: 40, top: 110, width: 1000, height: 720 }; // top / side
    case 'present-right':
      return slot === 'side'
        ? { left: 30, top: 640, width: 560, height: 760 }
        : slot === 'front'
          ? { left: 40, top: 1440, width: 700, height: 340 }
          : { left: 40, top: 110, width: 1000, height: 520 };
    case 'present-left':
      return slot === 'side'
        ? { left: 490, top: 640, width: 560, height: 760 }
        : slot === 'front'
          ? { left: 340, top: 1440, width: 700, height: 340 }
          : { left: 40, top: 110, width: 1000, height: 520 };
    case 'closeup':
      return slot === 'front'
        ? { left: 60, top: 1500, width: 960, height: 300 }
        : { left: 40, top: 90, width: 1000, height: 420 };
  }
}

export const DEFAULT_ANCHORS: Required<Omit<Anchors, 'screen' | 'mouth'>> & Pick<Anchors, 'mouth'> = {
  mouth: { x: 0.5, y: 0.42, scale: 0.11 },
  hand_r: { x: 0.24, y: 0.62 }, // her right hand = viewer's left
  hand_l: { x: 0.76, y: 0.62 },
  head: { x: 0.5, y: 0.22 },
};

/** The pose showing at `t` seconds, and when it started. */
export function poseAt(scene: ResolvedScene, t: number): { pose: Pose | null; start: number; index: number } {
  const poses = scene.poses ?? [];
  let cur: Pose | null = null;
  let start = 0;
  let index = -1;
  poses.forEach((p, i) => {
    const s = i === 0 ? 0 : cueSeconds(p, scene);
    if (s <= t + 1e-6) {
      cur = p;
      start = s;
      index = i;
    }
  });
  return { pose: cur, start, index };
}

export function makBox(scene: ResolvedScene): Rect {
  return STAGE_BOX[(scene.stage && scene.stage !== 'none' ? scene.stage : 'center') as Exclude<Stage, 'none'>];
}

/** Frame coordinates (px) of a point on Mak at time t. */
export function anchorPoint(scene: ResolvedScene, name: AnchorName, t: number): { x: number; y: number } {
  const box = makBox(scene);
  const { pose } = poseAt(scene, t);
  const a = { ...DEFAULT_ANCHORS, ...(pose?.anchors ?? {}) } as Anchors;
  const p = (name === 'screen' ? a.screen : a[name]) ?? DEFAULT_ANCHORS.hand_r;
  return { x: box.left + p.x * box.width, y: box.top + p.y * box.height };
}
