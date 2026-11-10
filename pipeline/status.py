"""Show or set scene statuses.

  uv run pipeline/status.py 001-matcha                       # table
  uv run pipeline/status.py 001-matcha s1-mak-marah approved # set (humans decide 'approved')
"""
from __future__ import annotations

import argparse

from common import STATUSES, effective_method, episode_dir, find_scene, load_scenes, save_scenes


def assets(ep_dir, s: dict, data: dict) -> str:
    if s["type"] != "mak_beat":
        parts = []
    elif effective_method(s, data) == "frames":
        d = ep_dir / s.get("frames", "")
        need = [f for p in s.get("poses", []) for f in p.get("frames", [])]
        have = sum((d / f).exists() for f in need)
        parts = [f"{len(s.get('poses', []))} poses, drawings {have}/{len(need)}"]
    else:
        parts = [
            "start✓" if (ep_dir / s.get("start_frame", "_")).exists() else "start✗",
            "end✓" if (ep_dir / s.get("end_frame", "_")).exists() else "end✗",
            "clip✓" if (ep_dir / s.get("clip", "_")).exists() else "clip✗",
        ]
    vo = s.get("vo", {}).get("file")
    if vo:
        parts.append("vo✓" if (ep_dir / vo).exists() else "vo✗")
    return " ".join(parts)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("scene", nargs="?")
    ap.add_argument("status", nargs="?", choices=STATUSES)
    a = ap.parse_args()

    data = load_scenes(a.episode)
    if a.scene and a.status:
        s = find_scene(data, a.scene)
        old = s.get("status", "draft")
        s["status"] = a.status
        save_scenes(a.episode, data)
        print(f"{a.scene}: {old} → {a.status}")
        return

    ep_dir = episode_dir(a.episode)
    total = 0.0
    print(f"plan: {data.get('plan', '-')}")
    print(f"{'scene':<16} {'type':<11} {'method':<7} {'len':>5}  {'status':<10} assets")
    for s in data["scenes"]:
        total += s.get("duration_s", 0)
        print(f"{s['id']:<16} {s['type']:<11} {effective_method(s, data) or '-':<7} {s.get('duration_s', 0):>5.1f}  "
              f"{s.get('status', 'draft'):<10} {assets(ep_dir, s, data)}")
    print(f"{'total':<36} {total:>5.1f}s")


if __name__ == "__main__":
    main()
