# Test plan 2 · ChatGPT + Kling on fal (001-matcha)

**Question:** do the two hero beats get better enough with real in-between
motion from Kling to justify spending on fal, and do they still sit well next to
the drawn beats?

**Run after Plan 1.** It reuses everything Plan 1 made (voice, model sheet,
mouths, sets, the other 5 beats), so the only difference between the two videos
is the slam (s1) and the sip-and-wink (s6).

## What runs where

| Part | Made with | Cost |
|---|---|---|
| Everything except s1 and s6 | reused from Plan 1 | $0 |
| s1 slam and s6 sip-and-wink, start/end keyframes | Plan 1's drawings (`windup` → `lean`, `sip` → `wink`) | $0 |
| Draft motion takes | Vidu Q3 540p on fal (keeps the end frame) | ~$0.28–0.42 per take |
| Final motion | Kling 3 Pro on fal, audio off | ~$0.45–0.67 per take |
| Lip sync | Kling lip sync on fal | ~$0.07–0.14 per clip |
| Background removal | FFmpeg key (free); fal fallback if fringes | $0–0.10 |

**Expected fal spend:** about $2 typical (one draft + one final per beat), up to ~$4.60 if every retry is
used. Cap in `scenes.json`: US$6. `run_model.py` refuses anything over.

## Before you start

- [ ] Plan 1 finished (its drawings for s1 and s6 exist)
- [ ] `FAL_KEY` in `.env`, a spend limit set in the fal dashboard
- [ ] Claude Code `/mcp`: fal-ai authenticated
- [ ] `uv run pipeline/plan.py 001-matcha kling`. s1 and s6 switch to `i2v` and get
      their own approval status; Plan 1's approvals are kept separately.

## Run

Tell Claude: **"/produce 001-matcha"**. It skips everything already done and
only makes the two clips: drafts → QA → final → lip sync → key. It stops at:

1. **Mak beats**: compare `clips/s1-mak-marah.webm` and `clips/s6-punchline.webm`
   in Remotion Studio → approve each
2. **Final**: watch `out/001-matcha-kling.mp4` → "approved"

To go back: `uv run pipeline/plan.py 001-matcha chatgpt` (nothing is deleted).

## What to check (fill in, s1 and s6 only)

| Check | s1 slam | s6 sip-wink |
|---|---|---|
| On-model through the whole clip (no face drift, curlers stay) | | |
| Still reads as a flat 2D TV cartoon (no 3D, no lighting change, no floaty morph) | | |
| Acting better than Plan 1's drawn version? | | |
| Sits next to the drawn beats without a style jump | | |
| Lip sync quality (Kling lip sync) | | |
| Clean edges after keying (no green/blue fringe) | | |
| Takes needed (drafts / finals) | | |
| fal cost for this beat | | |

**Output:** `out/001-matcha-kling.mp4`. Results go into [compare.md](compare.md).
