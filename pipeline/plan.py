"""Switch an episode between test plans (see test-plans/).

  uv run pipeline/plan.py 001-matcha            # show the active plan and what it changes
  uv run pipeline/plan.py 001-matcha kling      # switch

Scenes with `method_by_plan` keep a separate status per plan, so approving the
drawn version of a beat never counts as approving its Kling clip (and back).
Everything else (voiceover, other beats, sets) is shared between plans.
"""
from __future__ import annotations

import argparse

from common import die, effective_method, load_scenes, save_scenes


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("plan", nargs="?")
    a = ap.parse_args()
    data = load_scenes(a.episode)
    dual = [s for s in data["scenes"] if s.get("method_by_plan")]
    plans = sorted({p for s in dual for p in s["method_by_plan"]})

    if a.plan and a.plan != data.get("plan"):
        if a.plan not in plans:
            die(f"unknown plan '{a.plan}'. Plans: {', '.join(plans)}")
        old = data.get("plan", "chatgpt")
        for s in dual:
            s.setdefault("status_by_plan", {})[old] = s.get("status", "draft")
            s["status"] = s["status_by_plan"].get(a.plan, "draft")
        data["plan"] = a.plan
        save_scenes(a.episode, data)
        print(f"plan: {old} → {a.plan}")
    else:
        print(f"plan: {data.get('plan', 'chatgpt')}  (available: {', '.join(plans)})")
    for s in dual:
        print(f"  {s['id']:<16} {effective_method(s, data):<7} status {s.get('status')}")
    print("Next: uv run pipeline/checklist.py sync", a.episode)


if __name__ == "__main__":
    main()
