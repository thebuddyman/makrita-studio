---
description: Generate Mak's voiceover + word timestamps for an episode or one scene (gate 2)
argument-hint: <episode-id> [scene-id]
---

Arguments: `$ARGUMENTS`

1. Check `script.md` has `status: approved`. If not, stop and ask.
2. Check `voice.mak.voice_id` in `pipeline/config/models.yaml` is set. If it is
   still `TODO`, use the elevenlabs MCP to list voices, suggest 3 that fit Mak
   (warm, older Indonesian woman, can be loud), and stop for Thomas to pick.
3. Run `uv run pipeline/vo.py <episode> [scene]`. It writes `vo/<scene>.mp3`
   and `vo/<scene>.words.json`, logs characters to `cost.json`, and prints each
   take's length next to the scene's `duration_s`.
4. If a take is longer than its scene, propose a new `duration_s` (take + 0.3 s)
   and keep the total in 36–40 s. Edit `scenes.json` only after saying what you
   change, then run `uv run pipeline/validate.py <episode>`.

**Gate 2:** stop. List each mp3 path with its length and ask Thomas to listen
and approve, or say which lines to redo (re-run with the scene id, optionally
`--model eleven_multilingual_v2` or a tweaked `line_tts`).
