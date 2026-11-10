---
description: Render the episode to out/<episode>.mp4 from scenes.json (gate 4)
argument-hint: <episode-id> [--preview]
---

Arguments: `$ARGUMENTS`

1. `uv run pipeline/validate.py <episode> --for-render`. Any error (numbers,
   timing, missing files) blocks the render: show it and stop.
2. If any `mak_beat` is not `approved`, say which ones. Without `--preview`,
   stop and ask whether to render anyway (they show as grey placeholders).
3. In `remotion/`: `npm run sync -- <episode>` then
   - full: `npx remotion render Episode ../out/<episode>.mp4 --props='{"episode":"<episode>"}'`
   - `--preview`: add `--frames=0-149 --scale=0.5` and write `../out/<episode>-preview.mp4`.
4. Check the output with
   `ffprobe -v error -show_entries stream=width,height,r_frame_rate:format=duration -of json ../out/<episode>.mp4`
   → 1080×1920, 30 fps, 36–40 s (skip for preview).
5. `uv run pipeline/cost.py <episode>`.

**Gate 4:** stop. Give Thomas the mp4 path, length, and the cost vs the cap.
