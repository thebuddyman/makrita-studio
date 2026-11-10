# Test plan 1 · ChatGPT only (001-matcha)

**Question:** can Mak look and act like a 2D TV cartoon using only drawings
made on our ChatGPT plan, animated in Remotion, with zero spend on fal?

**Run by:** Steve (with Claude on autopilot) · **Approves:** Steve ·
**Script:** Thomas's matcha script

## What runs where

| Part | Made with | Cost |
|---|---|---|
| Model sheet, 8 mouth shapes, 3 sets | GPT Image 2 via Codex (ChatGPT plan) | $0 |
| All 7 Mak beats: 26 key poses → 58 drawings (keys, in-betweens, smears, blinks) | GPT Image 2 via Codex (ChatGPT plan) | $0 |
| The slam (s1) and sip-and-wink (s6) | drawn poses, like every other beat | $0 |
| Movement: holds, on twos, squash, blinks, lip sync, camera, FX | Remotion (local) | $0 |
| Voice | ElevenLabs | in plan |
| **fal** | not used | **$0** |

About 70 images in total, roughly 70–100 minutes of generation, one at a time.
This may take more than one ChatGPT usage window; Claude stops and says so if a
limit is hit.

## Before you start

- [ ] `uv run pipeline/doctor.py`: Codex logged in with ChatGPT ✓, ElevenLabs key ✓
      (no fal key needed for this plan)
- [ ] Thomas's script is in `episodes/001-matcha/prototype/`
- [ ] `uv run pipeline/plan.py 001-matcha chatgpt`

## Run

Tell Claude: **"/produce 001-matcha"**. It stops at:

1. **Script**: check `script.md` matches Thomas's script → "approved"
2. **Voice pick** (once): choose Mak's voice from 3 → reply with the name
3. **Voiceover**: listen to `vo/*.mp3` → "approved"
4. **Model sheet, mouths and sets** (once): look at `character/` and `sets/` → "approved"
5. **Mak beats**: open `qa/report.md`, then `cd remotion && npm run studio`
   with `previewUnapproved: true` and scrub every beat → approve per scene
6. **Final**: watch `out/001-matcha-chatgpt.mp4` → "approved"

## What to check (fill in)

| Check | Pass when | Result |
|---|---|---|
| On-model | Mak looks like the same character in all 26 poses | |
| TV-cartoon feel | Holds, snappy pose changes, no "AI morphing" | |
| Acting | The slam and the shock take land; you'd laugh with the sound off | |
| Lip sync | Mouth matches the voice within 2 frames; mouth sits on the face | |
| Mak × graphics | She points at or holds what's on screen; nothing covers her face | |
| Numbers | Rp10,8 jt · Rp900 rb · Rp6,48 jt exact | |
| Format | 1080×1920, 30 fps, 36–40 s | |
| QA first-try pass | Share of beats passing QA without a redraw (target ≥ 70 %) | |
| Redraws | Number of drawings redone | |
| Generation time | Total minutes of image generation | |
| ChatGPT limit hits | How many times Claude had to wait | |
| Steve's hands-on time | Minutes actually spent reviewing/approving | |
| fal cost | must be $0.00 (`uv run pipeline/cost.py 001-matcha`) | |

**Output:** `out/001-matcha-chatgpt.mp4`. Results go into [compare.md](compare.md).
