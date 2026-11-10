# Mak Rita Studio — what's left before the first video

Everything is installed and wired up. These are the steps only a human can do.

## 1. Keys (5 min)

1. **fal.ai** → https://fal.ai/dashboard/keys → create a key (it looks like `key_id:key_secret`).
   Set a monthly spend limit first in **Billing** (e.g. US$30).
2. **ElevenLabs** → https://elevenlabs.io/app/settings/api-keys → create a key,
   give it a credit limit.
3. Paste both into `.env` (already created, git-ignored):
   ```
   FAL_KEY=…
   ELEVENLABS_API_KEY=…
   ```

You do **not** need a ChatGPT/OpenAI login: GPT Image 2 runs through fal with the fal key.

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
| Steve runs the pipeline or only gets assets? | — | — |

At US$6 the pilot is tight: 2 hero clips on Kling (~$0.56 per 5 s take) plus
~35 GPT Image 2 frames (~$0.08 each at medium quality) is ~$5 before any retries.
US$10 gives room for retries.

## 5. Matcha copy

Drop the HTML prototype in `episodes/001-matcha/prototype/`. `script.md` and
`scenes.json` were rebuilt from the PRD's numbers and lines; Claude should match
them to the prototype word-for-word before gate 1.

Claude Code will ask permission for each pipeline command. To cut prompts, use
`/permissions` to allow the free ones (`uv run pipeline/validate.py`, `status.py`,
`cost.py`, `doctor.py`, `npm run sync`, `npx remotion render`), and allow the paid
ones (`fal_run.py`, `vo.py`) only once you trust the budget cap.

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

```bash
git add -A && git commit -m "Mak Rita studio workspace"
gh repo create makrita-studio --private --source . --push
```
Then invite Steve; he follows the "Setup guide for Steve's laptop" in the PRD,
with two changes: no `claude mcp add` needed (`.mcp.json` is in the repo), and
fal signs in via `/mcp` → Authenticate.
