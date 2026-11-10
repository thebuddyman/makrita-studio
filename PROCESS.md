# Mak Rita — production process

The full list of steps from idea to posted video.

**Who does what:** Thomas writes the script and hands it over. **Steve runs
everything after that**, from `/new-episode` to posting, and gives every approval. Every episode gets its own copy
at `episodes/<id>/checklist.md`, and Claude ticks it as work gets done:

- **auto** items are ticked by `uv run pipeline/checklist.py sync <id>` when the
  files prove it (voiceover exists, scene approved, render is 1080×1920…). Claude
  runs it after every command. If the proof disappears (e.g. a scene is
  regenerated), the tick is removed again.
- **human** items (approvals, posting) are ticked by Claude only when that person
  says so: `uv run pipeline/checklist.py tick <id> <item> --by Steve`. These ticks
  are never removed automatically.

**Autopilot:** Steve doesn't run each step. He gives Claude Thomas's script (or
types `/produce <id>`), and Claude works down this list on its own, stopping only
at the gates that are on (`gates` in `scenes.json`) or at a real blocker. Saying
"approved" / "lanjut" at a gate makes it continue.

To change the process, edit the template below; `checklist.py sync` rebuilds every
episode's checklist from it and keeps existing ticks.

## Once per machine (not per episode)

1. `.env` has `FAL_KEY` (hero video only) and `ELEVENLABS_API_KEY`
2. `codex login` → Sign in with ChatGPT (images use the ChatGPT plan)
3. Claude Code: approve the project MCP servers, `/mcp` → fal-ai → Authenticate
4. `uv run pipeline/doctor.py` all ✓ (character items excepted)
5. `/smoke-test` passes

---

<!-- template:start -->
## 1 · Script — Thomas hands over, Steve approves · `/new-episode {ep}`

- [ ] Script from Thomas dropped in `prototype/` <!-- script.prototype -->
- [ ] `script.md` written from it, with the Numbers table <!-- script.written -->
- [ ] `scenes.json` passes `validate.py` <!-- script.valid -->
- [ ] **Script approved (matches Thomas's script)** — Steve <!-- script.approved -->

## 2 · Voiceover — gate 2 (Steve) · `/vo {ep}`

- [ ] Mak's ElevenLabs voice chosen <!-- vo.voice -->
- [ ] Voiceover + timings generated for every line <!-- vo.generated -->
- [ ] Every take fits its scene length <!-- vo.fits -->
- [ ] **Voiceover approved** — Steve <!-- vo.approved -->

## 3 · Mak — gate 3 (Steve) · `/make-mak {ep}` → `/qa {ep}`

- [ ] Mak's model sheet generated <!-- mak.sheet -->
- [ ] 8 mouth shapes generated <!-- mak.mouths -->
- [ ] Background sets painted (`sets/`) <!-- mak.sets -->
- [ ] **Model sheet, mouth shapes + sets approved** — Steve <!-- mak.sheet_approved -->
<!-- scenes -->
- [ ] QA report written (`qa/report.md`) <!-- mak.qa_report -->

## 4 · Render — gate 4 (Steve) · `/render {ep}`

- [ ] Preview render made (`out/{ep}-<plan>-preview.mp4`) <!-- render.preview -->
- [ ] Final render is 1080×1920, 30 fps, 36–40 s (`out/{ep}-<plan>.mp4`) <!-- render.final -->
- [ ] Model cost at or under the cap (`cost.json`) <!-- render.cost -->
- [ ] **Final video approved** — Steve <!-- render.approved -->

## 5 · Publish

- [ ] Posted to TikTok / Instagram (by hand) — Steve <!-- post.posted -->
- [ ] Notes for the next episode written in `notes.md` <!-- post.notes -->
- [ ] Episode committed and pushed to GitHub <!-- post.pushed -->
<!-- template:end -->

Per Mak beat, the `<!-- scenes -->` line expands to three items:
assets generated (auto) · QA passed (auto) · **approved by Steve** (auto from
`scenes.json` status `approved`, which Claude sets only when Steve says so).
