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

**Gate 1:** stop. Ask Thomas to approve the script (or edit it). When he says it
is approved, set `status: approved` in the front matter of `script.md`.
