"""Check scenes.json: schema, timing, numbers vs script.md, and (for render) assets.

  uv run pipeline/validate.py 001-matcha               # after every scenes.json edit
  uv run pipeline/validate.py 001-matcha --for-render  # stricter: blocks /render

Exit code 1 when there is any error. Warnings never block.
"""
from __future__ import annotations

import argparse
import json
import re
import sys

from common import STATUSES, episode_dir, load_scenes, media_duration

RP = re.compile(r"Rp\s?\d[\d.,]*\s?(?:rb|jt|ribu|juta)?", re.I)
LAYOUTS = {"Hook", "Kenalin", "Marah", "Gelas", "Setahun", "Pun", "Solusi", "Punchline"}


def rp_value(text: str) -> float | None:
    m = re.match(r"Rp\s?([\d.,]+)\s?(rb|jt|ribu|juta)?", text.strip(), re.I)
    if not m:
        return None
    num = float(m.group(1).replace(".", "").replace(",", "."))
    unit = (m.group(2) or "").lower()
    return num * (1e3 if unit in ("rb", "ribu") else 1e6 if unit in ("jt", "juta") else 1)


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip().lower()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--for-render", action="store_true")
    a = ap.parse_args()

    ep = episode_dir(a.episode)
    data = load_scenes(a.episode)
    script_path = ep / "script.md"
    script = script_path.read_text() if script_path.exists() else ""
    errors: list[str] = []
    warns: list[str] = []
    E, W = errors.append, warns.append

    # ---- top level
    if data.get("fps") != 30:
        E("fps must be 30")
    if data.get("size") != [1080, 1920]:
        E("size must be [1080, 1920]")
    if not data.get("budget_usd"):
        E("budget_usd is missing")
    if not script:
        E("script.md is missing")

    scenes = data.get("scenes", [])
    ids = [s.get("id") for s in scenes]
    if len(ids) != len(set(ids)):
        E("scene ids are not unique")

    # ---- timing
    total = sum(s.get("duration_s", 0) for s in scenes)
    if not 36 <= total <= 40:
        E(f"total length {total:.1f}s is outside 36–40 s")
    if scenes and scenes[0].get("duration_s", 99) >= 3:
        E(f"hook ({scenes[0].get('id')}) must be under 3 s")
    if scenes and scenes[0].get("type") != "infographic":
        W("first scene is not an infographic hook")
    if not any("kenalin, mak rita" in norm(s.get("line", "")) for s in scenes[:3]):
        E('no "Kenalin, Mak Rita" intro in the first scenes')
    if not any("hidup frugal" in norm(s.get("line", "") + json.dumps(s.get("infographic", []))) for s in scenes):
        W('identity line "Mak yang bantu kamu hidup frugal" not found')
    if "mulai, mak" in norm(json.dumps(scenes, ensure_ascii=False)):
        E('"Mulai, Mak" must not appear (no end button)')

    # ---- per scene
    for s in scenes:
        sid = s.get("id", "?")
        for k in ("id", "type", "duration_s", "status"):
            if k not in s:
                E(f"{sid}: missing '{k}'")
        if s.get("status") not in STATUSES:
            E(f"{sid}: status '{s.get('status')}' not in {STATUSES}")
        if s.get("layout") and s["layout"] not in LAYOUTS:
            W(f"{sid}: layout '{s['layout']}' has no Remotion component yet (generic layout used)")
        if s.get("type") == "mak_beat":
            m = s.get("method")
            if m == "frames":
                for k in ("frames", "frame_count", "fps_anim", "mouth"):
                    if k not in s:
                        E(f"{sid}: frames beat needs '{k}'")
            elif m == "i2v":
                for k in ("start_frame", "end_frame", "clip"):
                    if k not in s:
                        E(f"{sid}: i2v beat needs '{k}'")
            else:
                E(f"{sid}: method must be 'frames' or 'i2v'")
            for k in ("emotion", "action"):
                if not s.get(k):
                    W(f"{sid}: no '{k}'")
        elif s.get("type") != "infographic":
            E(f"{sid}: type must be 'infographic' or 'mak_beat'")

        # voiceover vs scene length
        vo = (s.get("vo") or {}).get("file")
        if vo and (ep / vo).exists():
            d = media_duration(ep / vo)
            if d > s.get("duration_s", 0):
                (E if a.for_render else W)(f"{sid}: voiceover {d:.2f}s is longer than the scene {s.get('duration_s')}s")
        elif vo and a.for_render:
            W(f"{sid}: voiceover {vo} not generated yet (renders silent)")

        # numbers: every counter's display must match its value and be in script.md
        for item in s.get("infographic", []):
            disp = item.get("display")
            if disp:
                v = rp_value(disp)
                if v is not None and item.get("to") is not None and abs(v - item["to"]) > 0.5:
                    E(f"{sid}: counter display {disp} ≠ to={item['to']}")
                if disp not in script:
                    E(f"{sid}: number {disp} is not in script.md")
        on_screen = json.dumps(s.get("infographic", []), ensure_ascii=False)
        for fig in set(RP.findall(on_screen)):
            fig = fig.strip()
            if fig not in script:
                E(f"{sid}: on-screen figure '{fig}' is not in script.md")

        # assets for render
        if a.for_render and s.get("type") == "mak_beat" and s.get("status") == "approved":
            if s.get("method") == "frames":
                d = ep / s.get("frames", "")
                n = len(list(d.glob("*.png"))) if d.is_dir() else 0
                if n == 0:
                    E(f"{sid}: approved but no frames in {s.get('frames')}")
                elif n != s.get("frame_count"):
                    W(f"{sid}: frame_count {s.get('frame_count')} but {n} PNGs on disk")
            elif not (ep / s.get("clip", "_")).exists():
                E(f"{sid}: approved but clip {s.get('clip')} is missing")

    if a.for_render:
        pending = [s["id"] for s in scenes if s.get("type") == "mak_beat" and s.get("status") != "approved"]
        if pending:
            W(f"not approved yet (grey placeholder): {', '.join(pending)}")

    for w in warns:
        print(f"⚠ {w}")
    for e in errors:
        print(f"✗ {e}")
    print(f"{'✗' if errors else '✓'} {a.episode}: {len(scenes)} scenes, {total:.1f}s, "
          f"{len(errors)} error(s), {len(warns)} warning(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
