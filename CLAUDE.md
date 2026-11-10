# Mak Rita Studio

This repo turns a Mak Rita script into a finished 9:16 video. Mak is animated
like a 2D cartoon (frame sheets + mouth shapes, or image-to-video hero clips);
every other element is code-driven infographics in Remotion.

You (Claude) are the **orchestrator**. You run the pipeline, call models, check
the output and log the cost. Thomas and Steve make every creative call and every
approval. The PRD is "PRD: Mak Rita Agentic Video Workspace (Matcha Pilot)".

## House rules (never break these)

- **Format:** 9:16, 1080×1920, 30 fps. Episodes run 36–40 s.
- **Hook in the first 3 seconds.** Scene 0 is under 3 s and has no Mak intro.
- Then the short **"Kenalin, Mak Rita"** intro with the identity line
  **"Mak yang bantu kamu hidup frugal"**.
- **No "Mulai, Mak" button** (or any app CTA button) at the end.
- **Language:** Bahasa Indonesia, casual Gen Z tone. Mak calls the viewer "Nak".
  Mak is blunt, loving, a bit dramatic, never mean about money shame.
- **Mak framing:** half-body cut-out, bottom-anchored. Never the old circle crop.
- **No AI-drawn text** in any Mak frame or clip. All text comes from Remotion.
- **Numbers:** every rupiah figure on screen must match `script.md` exactly,
  written the Indonesian way (Rp10,8 jt · Rp900 rb · Rp6,48 jt).
- **Stop and ask at every checkpoint** (below). Never approve on a human's behalf.
- **Never exceed the per-episode budget cap** (`budget_usd` in `scenes.json`).
  `pipeline/fal_run.py` refuses a run that would go over; if it does, stop and
  ask. Do not raise the cap yourself.

## Checkpoints (human gates)

| Gate | After | Who approves | What you do |
|---|---|---|---|
| 1 Script | `/new-episode` | Thomas | Show `script.md` + scene table, wait |
| 2 Voiceover | `/vo` | Thomas | Give the mp3 paths + durations, wait |
| 3 Mak beats | `/make-mak` + `/qa` | Steve | Show frames/clips + `qa/report.md`, wait |
| 4 Final | `/render` | Thomas | Give the mp4 path + cost, wait |

A beat that fails QA **twice** goes to a human instead of looping.
Nothing renders for real until every `mak_beat` is `approved`.

## Where things live

```
CLAUDE.md               this file
.mcp.json               MCP servers (fal-ai, elevenlabs); keys come from env
.env                    FAL_KEY, ELEVENLABS_API_KEY (git-ignored, never print it)
.claude/agents/         scriptwriter, art-director, animator, qa
.claude/commands/       /new-episode /vo /make-mak /qa /render /status /smoke-test
artwork/                REFERENCE ONLY: copy of all app art from mak-rita-code/assets
                        (style, Mak's design, past prompts). Never edit, never put in a video as-is.
character/
  mak-reference/        model sheet (approved), palette.json, app-art/ (source art)
  mouth-shapes/         8 visemes reused every episode
episodes/<id>/
  script.md             the approved script (source of truth for copy + numbers)
  scenes.json           THE contract between agents and Remotion
  vo/ frames/ clips/    generated assets
  qa/                   QA reports, rejected takes
  cost.json             every paid call, appended by the pipeline
pipeline/               Python scripts (run with `uv run pipeline/<x>.py`)
  config/models.yaml    the ONLY place model ids, voice id and prices are named
remotion/               Remotion project; reads scenes.json, renders out/<id>.mp4
```

## scenes.json contract

- Agents write it step by step; Remotion only reads it.
- `type` is `infographic` or `mak_beat`. Only `mak_beat` scenes call image/video models.
- `method` for a mak_beat: `frames` (frame sheet + mouth overlay) or `i2v` (hero clip).
- `status`: `draft → generated → qa_passed → approved`. Only humans set `approved`
  (via `uv run pipeline/status.py <ep> <scene> approved` when they tell you to).
- Remotion renders approved Mak beats; others show a grey placeholder.
- Run `uv run pipeline/validate.py <ep>` after every edit to scenes.json.

## How to call models

- **Explore** with the MCP servers: fal-ai (search models, read schemas, check
  prices), elevenlabs (list voices, try a tag). Exploring is free; runs are not.
- **Produce** with the pipeline scripts so files land in the episode and cost is
  logged: `pipeline/vo.py` (voice + timestamps), `pipeline/fal_run.py` (every
  image/video/bg-removal/lip-sync run), `pipeline/chroma.py` (green key → alpha).
- Model ids live only in `pipeline/config/models.yaml`. To swap a model, change
  that file; never hard-code an id in a script, prompt or agent file.
- Always pass the approved model sheet (`character/mak-reference/model-sheet.png`)
  as a reference image for any Mak generation. Before it exists, use
  `character/mak-reference/app-art/` and say so.

## Re-running one scene

Every command takes an optional scene id (`/make-mak s1-mak-marah`). Only touch
what changed; never regenerate an approved scene unless asked.

## Don't

- Don't commit `.env`, don't echo keys, don't put keys in `.mcp.json`.
- Don't edit `remotion/public/` by hand; `npm run sync` copies episode assets in.
- Don't edit `artwork/` or use its files directly in a video; it is reference only.
- Don't publish to TikTok/Instagram (out of scope for the pilot).
