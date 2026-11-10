# Mak Rita Studio

Script → voiceover → animated Mak → Remotion render, run by Claude Code with
four human gates. First episode: **001-matcha** ("matcha kini boleh, matcha
depan gimana?").

- New here? Read **[SETUP.md](SETUP.md)** (keys, logins, open decisions).
- House rules and how Claude runs the pipeline: **[CLAUDE.md](CLAUDE.md)**.
- Models, voice and prices: `pipeline/config/models.yaml`.

## Commands (in Claude Code)

| Command | Does | Gate |
|---|---|---|
| `/smoke-test` | checks MCPs, 1 voice line, 5 s render (< US$0.50) | — |
| `/new-episode <id>` | scriptwriter → `script.md` + `scenes.json` | 1 script (Thomas) |
| `/vo <id> [scene]` | ElevenLabs voice + timestamps | 2 voiceover (Thomas) |
| `/make-mak <id> [scene]` | art-director + animator → frames/clips, then `/qa` | 3 Mak beats (Steve) |
| `/qa <id> [scene]` | on-model, artefact, text, timing, number checks | — |
| `/render <id> [--preview]` | Remotion → `out/<id>.mp4` | 4 final (Thomas) |
| `/status <id>` | scene table + cost vs cap | — |

## By hand

```bash
uv run pipeline/doctor.py                 # is this machine ready?
uv run pipeline/validate.py 001-matcha    # check scenes.json
uv run pipeline/status.py 001-matcha      # scene table
uv run pipeline/cost.py 001-matcha        # spend vs cap
cd remotion && npm run studio             # preview in the browser
```
In Remotion Studio, set the `previewUnapproved` prop to `true` to see generated
but not-yet-approved Mak beats.
