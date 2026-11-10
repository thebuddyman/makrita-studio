---
description: Generate Mak's frames and hero clips for every mak_beat (or one scene), then run QA (gate 3)
argument-hint: <episode-id> [scene-id]
---

Arguments: `$ARGUMENTS`

0. `uv run pipeline/cost.py <episode>`: say the spend so far vs `budget_usd`.
1. If `character/mak-reference/model-sheet.png` or `character/mouth-shapes/`
   is missing, run the **art-director**'s one-off model-sheet step first and
   stop for Steve to approve it. Do not make beats before that.
2. Pick the scenes: the given scene id, or every `mak_beat` whose status is
   `draft` (never `approved` ones). Voiceover must exist for each.
3. For each scene:
   - `method: frames` → **art-director** makes the frame sheet.
   - `method: i2v` → **art-director** makes start/end frames, then the
     **animator** makes, lip-syncs and keys the clip.
4. Run `/qa <episode>` (the **qa** sub-agent) on what was generated.
5. `uv run pipeline/cost.py <episode>` again.

**Gate 3:** stop. Show Steve `qa/report.md`, the frame folders and clip paths,
and `npm run studio` (in `remotion/`) to preview. Steve approves per scene; when
he says so, run `uv run pipeline/status.py <episode> <scene> approved`.

**Checklist:** After each scene and at the end, run `uv run pipeline/checklist.py sync <episode>`. When Steve approves the model sheet + mouths: `checklist.py tick <episode> mak.sheet_approved --by Steve`. When Steve approves a scene: `status.py <episode> <scene> approved`, then `checklist.py sync <episode>`.
