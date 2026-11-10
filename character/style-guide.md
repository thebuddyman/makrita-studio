# Mak Rita — animation style guide

Target feel: a **classic primetime 2D TV cartoon** (the kind of adult sitcom
animation from the US). We borrow its *craft*, never its characters, designs or
look: Mak stays exactly as drawn in the app (`character/mak-reference/`).

> In prompts, describe the technique below. **Never name a show, studio or
> character** in a prompt — image models refuse it or drift off Mak's design.

## Drawing

- Clean, even black outline (same weight on every drawing), slightly thicker on
  the silhouette.
- Flat cel colour + **one** hard-edged shadow tone per colour, light from top-left.
  No gradients, no texture, no rim light, no 3D shading.
- Simple, readable shapes; hands with 4 fingers are fine, but always the same
  count on every drawing.
- Mak's palette only (`palette.json`). No white sticker border in video art.

## Animation (pose-to-pose, limited)

- **Key poses carry the acting.** 2–4 poses per beat, each a clear silhouette
  that reads with the sound off.
- **Holds.** A pose is held still while she talks; only the mouth and blinks move.
- **On twos.** In-betweens play at 12 drawings/s (`fps_anim: 12`). 1–2
  in-betweens per pose change is enough.
- **Anticipation → action → settle.** Before a big move, a small opposite move
  (wind-up before the slam). Remotion adds a 2-frame squash on every pose change.
- **Smear drawing** for very fast moves (the slam, the shock take): one stretched,
  blurred-shape drawing between poses (`slam-smear.png`, `take-smear.png`).
- **Takes.** Big reactions are exaggerated for a few frames, then settle: eyes
  huge, jaw drops, curlers pop.
- **Cycles** only for repeated actions (wave, head shake, whisking): 2 drawings
  alternating (`cycle: true`).
- **Blinks** every ~3 s on held poses (`<pose>-blink.png`).
- **Lip sync** with 8 mouth shapes laid over the face per pose. Talking poses
  are drawn front or near-front with the mouth closed; the overlay does the talking.

## Staging and camera

- Mak shares the frame with the graphics like a presenter: `present-left` /
  `present-right` when she points at something, `center` for direct address,
  `closeup` for punch lines.
- Props she holds that show text or numbers (phone) are **blank** in the drawing;
  Remotion fills them so every number is exact.
- Camera = **cuts and snap zooms**, not glides: a 4-frame push-in on the punch
  word, a shake on impacts. Effects (impact star, speed lines, sweat, sparkle,
  shock lines, anger mark) are drawn by Remotion on twos.

## Backgrounds (sets)

- Flat painted interiors in a simplified, slightly skewed perspective, muted
  colours so Mak and the graphics pop. No people, no text, no logos.
- Sets are reused across episodes: `sets/ruang-tamu.png` (living room),
  `sets/ruang-makan.png` (dining table), `sets/dapur.png` (kitchen).
- 1080×1920, with the lower 45 % calm (Mak stands there) and the upper part
  simple (graphics go there).

## Prompt building blocks (copy these)

**Style:** "flat 2D TV cartoon cel animation drawing, clean uniform black outlines,
flat colours with one hard shadow tone, no gradients, no texture"

**Mak:** "Mak Rita exactly as in the reference images: round face, warm tan skin,
black curly hair full of pink hair curlers, purple scrunchie, small gold stud
earrings, two small plasters at the temples, purple batik house dress (daster)
with cream wavy stripes and dots"

**Framing:** "half-body, centred, the bottom edge of the image cuts at her waist,
same scale and position as the reference pose"

**Safety:** "no text, no letters, no numbers, no logos, no border, no sticker outline"
