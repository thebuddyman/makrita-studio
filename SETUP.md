# Mak Rita Studio — what's left before the first video

Everything is installed and wired up. These are the steps only a human can do.

## What runs on what

| Job | Runs on | Cost |
|---|---|---|
| Orchestration, scripts, QA (Claude) | your **Claude subscription** in Claude Code | in your plan |
| All images: model sheet, mouth shapes, frames (GPT Image 2) | your **ChatGPT subscription** via Codex CLI | in your plan (uses its quota) |
| Mak's voice | ElevenLabs API | in your ElevenLabs plan |
| 2 hero video clips + lip sync | fal API | ~US$1–4 per episode |

## 1. Logins and keys (5 min)

0. **ChatGPT (images)** — already done on this Mac: Codex CLI is installed and
   logged in with ChatGPT. On another machine: `npm install -g @openai/codex`,
   then `codex login` → *Sign in with ChatGPT*.
1. **fal.ai** (video only) → https://fal.ai/dashboard/keys → create a key (it looks like `key_id:key_secret`).
   Set a monthly spend limit first in **Billing** (e.g. US$15).
2. **ElevenLabs** → https://elevenlabs.io/app/settings/api-keys → create a key,
   give it a credit limit.
3. Paste both into `.env` (already created, git-ignored):
   ```
   FAL_KEY=…
   ELEVENLABS_API_KEY=…
   ```

No OpenAI or Anthropic API key is needed anywhere.

## 2. Log in to the MCP servers (2 min)

Open Claude Code in this folder (VS Code panel or `claude` in the terminal), then:

1. Claude Code asks once to trust the two project servers in `.mcp.json`
   (fal-ai, elevenlabs) → approve both. Then type `/mcp`.
2. **fal-ai** → choose **Authenticate** → sign in to fal in the browser (OAuth;
   no key needed for the MCP).
3. **elevenlabs** should show *connected* on its own (it reads `.env`). If it
   doesn't, restart Claude Code after saving `.env`.

## 3. Check

```bash
uv run pipeline/doctor.py
```
Keys and tools should be ✓. The voice id and character items stay ✗ until steps 4–5.

## 4. Decisions the PRD left open

| Question | Where it goes | Now |
|---|---|---|
| Budget cap per episode (US$6 / 10 / 15)? | `budget_usd` in `episodes/001-matcha/scenes.json` | **6** (PRD example) |
| Mak's ElevenLabs voice | `voice.mak.voice_id` in `pipeline/config/models.yaml` | `TODO` — `/vo` lists candidates |
| Canonical design (current app art vs redesign)? | `character/mak-reference/` | app art copied in `app-art/` as reference |
| Steve runs the pipeline or only gets assets? | — | **Answered:** Thomas hands over the script, Steve runs everything to the end |

With images on the ChatGPT plan, only video spends money: 2 hero clips with
draft takes on Vidu (~$0.35 per 5 s) and finals on Kling (~$0.56 per 5 s) plus
lip sync is ~$1–4 including retries, so US$6 is enough.

ChatGPT plan limits: an episode needs ~40 images (≈ 40–60 min, one at a time).
If Codex hits the plan limit mid-episode, Claude stops and tells you; wait for the
limit to reset, or allow the paid `image.frame_fal` backup.

To switch the 2 hero beats to frame sheets as well (zero fal spend), change
`"method": "i2v"` to `"frames"` for `s1-mak-marah` and `s6-punchline` in
`scenes.json` (or ask Claude to).

## 5. Matcha copy

Drop the HTML prototype in `episodes/001-matcha/prototype/`. `script.md` and
`scenes.json` were rebuilt from the PRD's numbers and lines; Claude should match
them to the prototype word-for-word before gate 1.

Claude Code will ask permission for each pipeline command. To cut prompts, use
`/permissions` to allow the free ones (`uv run pipeline/validate.py`, `status.py`,
`cost.py`, `doctor.py`, `npm run sync`, `npx remotion render`), and allow the paid
ones (`run_model.py`, `vo.py`) only once you trust the budget cap.

## Progress checklist

[PROCESS.md](PROCESS.md) lists every step. Each episode has its own
`episodes/<id>/checklist.md` that Claude keeps ticked: files prove the automatic
items, and approvals are ticked with the approver's name and date when you tell
Claude ("vo approved", "s2 approved"). Steve gives every approval after the
script. `/status <id>` shows it any time.

## 6. Run (when you're ready)

```
/smoke-test                 # < US$0.50: MCPs, one voice line, 5 s render
/new-episode 001-matcha     # gate 1: script
/vo 001-matcha              # gate 2: voiceover
/make-mak 001-matcha        # model sheet first (approve), then beats → /qa → gate 3
/render 001-matcha          # gate 4: out/001-matcha.mp4
/status 001-matcha          # any time
```

## 7. Share with Steve

The repo is at https://github.com/thebuddyman/makrita-studio (private).
Invite Steve; he follows the "Setup guide for Steve's laptop" in the PRD,
with three changes: no `claude mcp add` needed (`.mcp.json` is in the repo),
fal signs in via `/mcp` → Authenticate, and he runs `codex login` with his own
ChatGPT plan if he generates images.
