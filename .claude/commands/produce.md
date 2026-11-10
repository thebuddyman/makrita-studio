---
description: Autopilot — take an episode from Thomas's script to a finished video, stopping only at approval gates or real blockers
argument-hint: <episode-id> [script text or path]  (e.g. 002-kopi)
---

Episode and input: `$ARGUMENTS`

You run the whole pipeline yourself. Steve should not have to type a command per
step: he hands you Thomas's script once, answers at the gates, and you do the rest.

## Loop

Repeat until you hit a STOP:

1. `uv run pipeline/checklist.py sync <ep>` (creates the episode's checklist if new;
   if the folder doesn't exist, create it like `/new-episode` step 1 and put the
   script Steve gave you in `prototype/script.md`).
2. Read `episodes/<ep>/checklist.md`. Take the **first unticked item** and do what
   it needs (table below). Don't ask permission for routine steps.
3. After the step, sync again and give Steve a one-line progress update
   (`✓ <what you did> · <done>/<total> · next: <item>`). Continue.

| First open item | Do this (same as the command it names) |
|---|---|
| `script.prototype` | Ask Steve for Thomas's script (STOP) unless he already gave it |
| `script.written`, `script.valid` | `scriptwriter` sub-agent from Thomas's script, then `validate.py` and fix |
| `script.approved` | gate **script** |
| `vo.voice` | Shortlist 3 voices via the elevenlabs MCP → STOP for Steve to pick (once ever) |
| `vo.generated`, `vo.fits` | `uv run pipeline/vo.py <ep>`; re-time `duration_s` if a take is long |
| `vo.approved` | gate **voiceover** |
| `mak.sheet`, `mak.mouths` | `art-director` one-off model sheet + mouths (once ever) |
| `mak.sheet_approved` | gate **mak** (once ever) |
| `mak.sets` | `art-director` paints the background sets (once ever) |
| `scene.*.generated` | method for the active `plan` (`uv run pipeline/plan.py <ep>`): `frames` → `art-director` draws the poses; `i2v` → `art-director` makes sure the keyframe drawings exist, then `animator` |
| `scene.*.qa` | `qa` sub-agent; on fail regenerate (max 2 retries) |
| `scene.*.approved` | gate **mak** — batch ALL scenes that passed QA into one review |
| `mak.qa_report` | `qa` sub-agent writes the report |
| `render.preview`, `render.final`, `render.cost` | `/render` steps (preview, then final) for the active plan → `out/<ep>-<plan>.mp4` |
| `render.approved` | gate **final** |
| `post.notes` | write `notes.md`: what went wrong, retries, cost, what to change next time |
| `post.posted` | STOP: Steve posts by hand, then says so |
| `post.pushed` | `git add` the episode + `git commit` + `git push`, then tick `post.pushed --by Claude` |

## Gates

`gates` in `scenes.json` says which gates are on (`script`, `voiceover`, `mak`,
`final`). At a gate that is **on**: STOP, show exactly what to review (paths,
lengths, the QA report, `cd remotion && npm run studio` with
`previewUnapproved: true`), and ask for approval in one question. At a gate that is
**off**: approve it yourself and continue — set `status: approved` in script.md,
`status.py <ep> <scene> approved` for QA-passed scenes; `checklist.py sync` ticks
the rest as "auto · gate off".

When Steve answers:
- "ok / approved / lanjut / go" → tick the gate's items `--by Steve` (scenes:
  `status.py … approved`), then **continue the loop without being asked**.
- Changes requested → do them (only the scenes/lines named), re-run QA, and come
  back to the same gate.

## Real blockers (STOP and say exactly what's needed)

- a missing key or login (`doctor.py` shows ✗), the Codex/ChatGPT plan limit,
  the fal budget cap (`run_model.py` exit 3), a scene FLAGGED after 2 failed QA
  rounds, a number in the script that doesn't add up.

Never skip an item, never tick an approval nobody gave (unless its gate is off),
never raise the budget cap.
