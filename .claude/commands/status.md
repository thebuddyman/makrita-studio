---
description: Show where an episode stands — scene statuses, assets present, cost vs cap
argument-hint: <episode-id>
---

Run `uv run pipeline/checklist.py sync $ARGUMENTS`, `uv run pipeline/status.py
$ARGUMENTS` and `uv run pipeline/cost.py $ARGUMENTS`. Show the checklist's progress
line and open items for the current stage, then say in two lines what the next
step is (which command, which gate, who has to approve).
