"""Print what an episode has cost so far vs its cap.

  uv run pipeline/cost.py 001-matcha
"""
from __future__ import annotations

import argparse
from collections import defaultdict

from common import budget, load_cost, spent


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    a = ap.parse_args()

    entries = load_cost(a.episode)["entries"]
    by_job: dict[str, list] = defaultdict(lambda: [0, 0.0])
    for e in entries:
        k = e.get("job", "?")
        by_job[k][0] += 1
        by_job[k][1] += e.get("usd", 0)

    for job, (n, usd) in sorted(by_job.items()):
        print(f"  {job:<22} {n:>3} runs  ${usd:7.2f}")
    used, cap = spent(a.episode), budget(a.episode)
    pct = (used / cap * 100) if cap else 0
    print(f"  {'TOTAL':<22} {len(entries):>3} runs  ${used:7.2f} of ${cap:.2f} cap ({pct:.0f}%)")


if __name__ == "__main__":
    main()
