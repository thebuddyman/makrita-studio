---
description: First-run check — MCP servers, one 3 s voice line, one 5 s preview render. Costs < US$0.50.
---

Run these in order and report ✅/❌ for each. Stop at the first ❌ and say how to fix it.

1. **Keys + logins:** `uv run pipeline/doctor.py` (tools, Codex logged in with ChatGPT, .env keys, voice id; prints no secrets).
2. **fal MCP:** use the fal-ai MCP to list image-to-video models. Show 5 names.
   Do not run any model.
3. **ElevenLabs MCP:** use the elevenlabs MCP to list voices (names only).
4. **Voice line:** `uv run pipeline/vo.py 001-matcha --test "Kenalin, Mak Rita. Mak yang bantu kamu hidup frugal."`
   → `episodes/001-matcha/vo/test.mp3` + `test.words.json`, logged in `cost.json`.
5. **Render:** in `remotion/`: `npm run sync -- 001-matcha` then
   `npx remotion render Episode ../out/smoke-test.mp4 --frames=0-149 --props='{"episode":"001-matcha"}'`
   (5 s, placeholders for Mak are expected).
6. `uv run pipeline/cost.py 001-matcha` → must be under US$0.50.

Do NOT generate an image here (it is free but slow; the first real image is Mak's model sheet). Then delete nothing; tell the user the smoke test passed and that the next step
is `/new-episode 001-matcha`.
