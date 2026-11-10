# Mak Rita Studio

This repo turns a Mak Rita script into a finished 9:16 video. Mak is animated
like a 2D cartoon (frame sheets + mouth shapes, or image-to-video hero clips);
every other element is code-driven infographics in Remotion.

You (Claude) are the **orchestrator**. You run the pipeline, call models, check
the output and log the cost. **Thomas writes the script and hands it over;
Steve runs the pipeline from there to the end** and makes every creative call and every
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
  `pipeline/run_model.py` refuses a run that would go over; if it does, stop and
  ask. Do not raise the cap yourself.

## Autopilot (default way of working)

Steve should not need a command per step. Work like `/produce`:

- When Steve hands you a script ("ini script dari Thomas buat 002-kopi …"), or says
  "go", "lanjut", "continue", "approved", or runs `/produce <ep>`: sync the
  checklist and **keep doing the next open item yourself** until you reach a gate
  that is on, or a real blocker. Give a one-line update after each step.
- When he approves at a gate, tick it with his name and **carry on without being
  asked**. When he asks for changes, redo only what he named and return to the gate.
- The per-step commands (`/vo`, `/make-mak`, `/qa`, `/render`) still exist for
  re-running one thing; you don't need them to move forward.
- Gates can be switched off per episode in `scenes.json` → `gates`
  (`script`, `voiceover`, `mak`, `final`). Only Steve turns a gate off. When one
  is off you approve that step yourself after QA and keep going.
- Real blockers: missing key/login, ChatGPT plan limit, fal budget cap, a scene
  that failed QA twice, numbers in Thomas's script that don't add up.

## Checkpoints (human gates)

| Gate | After | Who approves | What you do |
|---|---|---|---|
| 1 Script | `/new-episode` | Steve (script comes from Thomas) | Show `script.md` + scene table, check it matches Thomas's script word for word, wait |
| 2 Voiceover | `/vo` | Steve | Give the mp3 paths + durations, wait |
| 3 Mak beats | `/make-mak` + `/qa` | Steve | Show frames/clips + `qa/report.md`, wait |
| 4 Final | `/render` | Steve | Give the mp4 path + cost, wait |

Never rewrite Thomas's lines or numbers. If something in his script breaks a house
rule (hook too long, missing intro, numbers don't add up), point it out to Steve
and suggest a fix; Steve decides or checks with Thomas.

A beat that fails QA **twice** goes to a human instead of looping.
Nothing renders for real until every `mak_beat` is `approved`.

## The checklist (always keep it current)

Every episode has `episodes/<id>/checklist.md`, built from `PROCESS.md`.

- **Start of any session or command** on an episode: run
  `uv run pipeline/checklist.py show <ep>` and tell the user where things stand.
- **After every step** that makes or changes something (script, voiceover,
  frames, clips, QA, render): run `uv run pipeline/checklist.py sync <ep>`. It ticks
  what the files prove and unticks what they no longer prove.
- **When a person approves something**, tick it right away with their name:
  `uv run pipeline/checklist.py tick <ep> <item> --by Steve` (items:
  `script.approved` is ticked by setting `status: approved` in script.md;
  `vo.approved`, `mak.sheet_approved`, `render.approved`, `post.posted`,
  `post.pushed` are ticked with `tick`; scene approvals come from `status.py … approved`
  followed by `sync`).
- Never tick an approval nobody gave. End each command by printing the
  checklist's progress line and **Next:** line.

## Where things live

```
CLAUDE.md               this file
.mcp.json               MCP servers (fal-ai, elevenlabs); keys come from env
.env                    FAL_KEY, ELEVENLABS_API_KEY (git-ignored, never print it)
.claude/agents/         scriptwriter, art-director, animator, qa
.claude/commands/       /new-episode /vo /make-mak /qa /render /status /smoke-test
PROCESS.md              the master process list (template for every checklist)
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
  cost.json             every model call, appended by the pipeline
  checklist.md          progress, ticked by Claude (see "The checklist")
pipeline/               Python scripts (run with `uv run pipeline/<x>.py`)
  config/models.yaml    the ONLY place model ids, voice id and prices are named
remotion/               Remotion project; reads scenes.json, renders out/<id>.mp4
```

## Look: Mak + graphics as a 2D TV cartoon

Read `character/style-guide.md` before any Mak work. In short: Mak presents the
graphics (stands beside them, points, holds a phone whose screen Remotion fills),
animated pose-to-pose with holds, on twos, smears, takes, blinks and lip sync,
over flat painted sets, with snap zooms and shakes. Never name a TV show or
studio in a prompt; describe the technique.

## Test plans

`scenes.json` → `plan` is `chatgpt` (every beat drawn, $0 fal) or `kling` (hero
beats s1/s6 as Kling clips on fal, keyframed from the chatgpt drawings). Switch
with `uv run pipeline/plan.py <ep> <plan>`; renders go to `out/<ep>-<plan>.mp4`.
See `test-plans/` (plan 1, plan 2, compare.md). Run plan 1 first.

## scenes.json contract

- Agents write it step by step; Remotion only reads it.
- `type` is `infographic` or `mak_beat`. Only `mak_beat` scenes call image/video models.
- A mak_beat's method is `frames` (drawn poses + mouth overlay) or `i2v` (hero
  clip); scenes with `method_by_plan` take it from the active `plan`.
- `stage` places Mak (`center`, `present-left`, `present-right`, `closeup`);
  `set` is the background; `poses` are key poses with `desc`, drawings
  (`frames`), an optional `blink`/`cycle`, a cue (`at` seconds or `at_word`) and
  measured `anchors`. Infographic items and `camera.moves` are cued the same way
  and placed by `slot` (`top`, `side`, `front`, `bottom`, `full`) or `anchor`
  (`hand_r`, `hand_l`, `head`, `mouth`, `screen`).
- `status`: `draft → generated → qa_passed → approved`. Only humans set `approved`
  (via `uv run pipeline/status.py <ep> <scene> approved` when they tell you to).
- Remotion renders approved Mak beats; others show a grey placeholder.
- Run `uv run pipeline/validate.py <ep>` after every edit to scenes.json.

## How to call models

- **Explore** with the MCP servers: fal-ai (search models, read schemas, check
  prices), elevenlabs (list voices, try a tag). Exploring is free; runs are not.
- **Produce** with the pipeline scripts so files land in the episode and cost is
  logged: `pipeline/vo.py` (voice + timestamps), `pipeline/run_model.py` (every
  image/video/bg-removal/lip-sync run), `pipeline/chroma.py` (green key → alpha).
- **Images use the ChatGPT plan, not an API.** `image.*` jobs have
  `backend: codex`: `run_model.py` drives Codex CLI's `$imagegen` (GPT Image 2),
  logged in with ChatGPT. They cost $0 but use plan quota and take ~1 min each:
  generate **one at a time**, never in parallel. If Codex reports a limit, stop
  and tell the user; only use the paid `image.frame_fal` job if they say so.
- **fal is only for video** (hero clips, lip sync, video bg removal) and is the
  only thing that spends money against the cap.
- Claude itself runs on the user's Claude subscription inside Claude Code; there
  is no Anthropic API key and none is needed.
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
