---
description: Run the QA sub-agent on generated Mak beats + validate timing and numbers
argument-hint: <episode-id> [scene-id]
---

Arguments: `$ARGUMENTS`

Hand this to the **qa** sub-agent: check every `mak_beat` with status
`generated` (or just the given scene), run `uv run pipeline/validate.py
<episode>`, and write `episodes/<episode>/qa/report.md`.

Then print the report's summary table and the list of FLAGGED scenes. For a
failed scene with fewer than 2 retries, offer to regenerate it with
`/make-mak <episode> <scene>`.
