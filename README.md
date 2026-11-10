# Mak Rita Studio

Script → voiceover → animated Mak → Remotion render, run by Claude Code with
four human gates. Thomas writes the script; Steve runs the pipeline and approves
every gate through to posting. First episode: **001-matcha** ("matcha kini boleh, matcha
depan gimana?").

- New here? Read **[SETUP.md](SETUP.md)** (keys, logins, open decisions).
- Every step from idea to post: **[PROCESS.md](PROCESS.md)**. Each episode's
  progress is ticked by Claude in `episodes/<id>/checklist.md`.
- Images run on the ChatGPT plan (Codex CLI), Claude on the Claude plan; fal is
  only for the hero video clips.
- House rules and how Claude runs the pipeline: **[CLAUDE.md](CLAUDE.md)**.
- Models, voice and prices: `pipeline/config/models.yaml`.

## Usually: just hand over the script

> "Ini script dari Thomas buat 002-kopi: …"  — or —  `/produce 002-kopi`

Claude runs every step on its own (autopilot, see [CLAUDE.md](CLAUDE.md)), ticks
the episode's checklist as it goes, and only stops at an approval gate or a real
blocker. Reply "approved" / "lanjut" and it carries on. Turn gates off per
episode in `scenes.json` → `gates` once you trust a step.

## Test plans

Two ways to make Mak move, compared on the matcha episode:
[plan 1 · ChatGPT only](test-plans/plan-1-chatgpt-only.md) ($0 fal) and
[plan 2 · + Kling on fal](test-plans/plan-2-chatgpt-kling.md) (~$2), scored in
[compare.md](test-plans/compare.md). Switch with `uv run pipeline/plan.py 001-matcha <chatgpt|kling>`.

## Commands (in Claude Code)

| Command | Does | Gate |
|---|---|---|
| `/produce <id> [script]` | **autopilot**: runs everything below in order | stops at gates that are on |
| `/smoke-test` | checks MCPs, 1 voice line, 5 s render (< US$0.50) | — |
| `/new-episode <id>` | scriptwriter → `script.md` + `scenes.json` | 1 script (Steve, from Thomas's script) |
| `/vo <id> [scene]` | ElevenLabs voice + timestamps | 2 voiceover (Steve) |
| `/make-mak <id> [scene]` | art-director + animator → frames/clips, then `/qa` | 3 Mak beats (Steve) |
| `/qa <id> [scene]` | on-model, artefact, text, timing, number checks | — |
| `/render <id> [--preview]` | Remotion → `out/<id>.mp4` | 4 final (Steve) |
| `/status <id>` | scene table + cost vs cap | — |

## By hand

```bash
uv run pipeline/doctor.py                 # is this machine ready?
uv run pipeline/validate.py 001-matcha    # check scenes.json
uv run pipeline/status.py 001-matcha      # scene table
uv run pipeline/cost.py 001-matcha        # spend vs cap
uv run pipeline/checklist.py show 001-matcha   # progress + next step
cd remotion && npm run studio             # preview in the browser
```
In Remotion Studio, set the `previewUnapproved` prop to `true` to see generated
but not-yet-approved Mak beats.
