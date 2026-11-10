---
description: Start an episode from an idea or rough script → script.md + draft scenes.json (gate 1)
argument-hint: <episode-id e.g. 002-kopi> [idea or path to rough script]
---

Episode: `$ARGUMENTS`

1. If `episodes/<id>/` does not exist, create it with `vo/ frames/ clips/ qa/`
   and a `cost.json` like `episodes/001-matcha/cost.json`.
2. If `episodes/<id>/script.md` and `scenes.json` already exist (e.g. 001-matcha),
   do not rewrite them: run `uv run pipeline/validate.py <id>` and show the scene
   table instead.
3. Otherwise hand the idea to the **scriptwriter** sub-agent.
4. Show the scene table, the numbers table and any validation warnings.

The script comes from Thomas (in `prototype/` or pasted in). Keep his lines and
numbers exactly; only structure them.

**Gate 1:** stop. Ask Steve to check `script.md` against Thomas's script and
approve it. When he says it is approved, set `status: approved` in the front
matter of `script.md`.

**Checklist:** Then run `uv run pipeline/checklist.py sync <id>` (creates `checklist.md`) and show its progress + Next line.
