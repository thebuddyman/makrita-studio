# Checklist · 001-matcha · plan chatgpt — matcha kini boleh, matcha depan gimana?

**2/41 done** `█░░░░░░░░░░░░░░░░░░░`  
**Next:** Script from Thomas dropped in prototype/

Gates on: script, voiceover, mak, final

> Kept by Claude from [PROCESS.md](../../PROCESS.md). Auto items follow the files;
> approvals are ticked with who and when. Run `uv run pipeline/checklist.py sync 001-matcha` to refresh.

## 1 · Script — Thomas hands over, Steve approves · `/new-episode 001-matcha`

- [ ] Script from Thomas dropped in `prototype/` <!-- script.prototype -->
- [x] `script.md` written from it, with the Numbers table — ✓ 2026-11-10 · auto <!-- script.written -->
- [x] `scenes.json` passes `validate.py` — ✓ 2026-11-10 · auto <!-- script.valid -->
- [ ] **Script approved (matches Thomas's script)** — Steve <!-- script.approved -->

## 2 · Voiceover — gate 2 (Steve) · `/vo 001-matcha`

- [ ] Mak's ElevenLabs voice chosen <!-- vo.voice -->
- [ ] Voiceover + timings generated for every line <!-- vo.generated -->
- [ ] Every take fits its scene length <!-- vo.fits -->
- [ ] **Voiceover approved** — Steve <!-- vo.approved -->

## 3 · Mak — gate 3 (Steve) · `/make-mak 001-matcha` → `/qa 001-matcha`

- [ ] Mak's model sheet generated <!-- mak.sheet -->
- [ ] 8 mouth shapes generated <!-- mak.mouths -->
- [ ] Background sets painted (`sets/`) <!-- mak.sets -->
- [ ] **Model sheet, mouth shapes + sets approved** — Steve <!-- mak.sheet_approved -->
- [ ] `s0b-kenalin` poses drawn <!-- scene.s0b-kenalin.generated -->
- [ ] `s0b-kenalin` QA passed <!-- scene.s0b-kenalin.qa -->
- [ ] **`s0b-kenalin` approved** — Steve <!-- scene.s0b-kenalin.approved -->
- [ ] `s1-mak-marah` poses drawn <!-- scene.s1-mak-marah.generated -->
- [ ] `s1-mak-marah` QA passed <!-- scene.s1-mak-marah.qa -->
- [ ] **`s1-mak-marah` approved** — Steve <!-- scene.s1-mak-marah.approved -->
- [ ] `s2-20-gelas` poses drawn <!-- scene.s2-20-gelas.generated -->
- [ ] `s2-20-gelas` QA passed <!-- scene.s2-20-gelas.qa -->
- [ ] **`s2-20-gelas` approved** — Steve <!-- scene.s2-20-gelas.approved -->
- [ ] `s3-setahun` poses drawn <!-- scene.s3-setahun.generated -->
- [ ] `s3-setahun` QA passed <!-- scene.s3-setahun.qa -->
- [ ] **`s3-setahun` approved** — Steve <!-- scene.s3-setahun.approved -->
- [ ] `s4-pun` poses drawn <!-- scene.s4-pun.generated -->
- [ ] `s4-pun` QA passed <!-- scene.s4-pun.qa -->
- [ ] **`s4-pun` approved** — Steve <!-- scene.s4-pun.approved -->
- [ ] `s5-solusi` poses drawn <!-- scene.s5-solusi.generated -->
- [ ] `s5-solusi` QA passed <!-- scene.s5-solusi.qa -->
- [ ] **`s5-solusi` approved** — Steve <!-- scene.s5-solusi.approved -->
- [ ] `s6-punchline` poses drawn <!-- scene.s6-punchline.generated -->
- [ ] `s6-punchline` QA passed <!-- scene.s6-punchline.qa -->
- [ ] **`s6-punchline` approved** — Steve <!-- scene.s6-punchline.approved -->
- [ ] QA report written (`qa/report.md`) <!-- mak.qa_report -->

## 4 · Render — gate 4 (Steve) · `/render 001-matcha`

- [ ] Preview render made (`out/001-matcha-<plan>-preview.mp4`) <!-- render.preview -->
- [ ] Final render is 1080×1920, 30 fps, 36–40 s (`out/001-matcha-<plan>.mp4`) <!-- render.final -->
- [ ] Model cost at or under the cap (`cost.json`) <!-- render.cost -->
- [ ] **Final video approved** — Steve <!-- render.approved -->

## 5 · Publish

- [ ] Posted to TikTok / Instagram (by hand) — Steve <!-- post.posted -->
- [ ] Notes for the next episode written in `notes.md` <!-- post.notes -->
- [ ] Episode committed and pushed to GitHub <!-- post.pushed -->
