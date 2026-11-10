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

from common import STATUSES, effective_method, episode_dir, load_scenes, media_duration

RP = re.compile(r"Rp\s?\d[\d.,]*\s?(?:rb|jt|ribu|juta)?", re.I)
STAGES_OK = {"none", "center", "present-left", "present-right", "closeup"}
SLOTS = {"full", "top", "side", "front", "bottom"}
ANCHORS = {"mouth", "hand_r", "hand_l", "head", "screen"}


def words_of(line: str) -> list[str]:
    return [re.sub(r"[^\w]", "", w.lower()) for w in line.split() if re.sub(r"[^\w]", "", w)]


def check_cue(sid: str, what: str, cue: dict, line: str, E) -> None:
    w = cue.get("at_word")
    if w:
        word, _, nth = w.partition("#")
        n = int(nth or 1)
        if words_of(line).count(re.sub(r"[^\w]", "", word.lower())) < n:
            E(f"{sid}: {what} cue at_word '{w}' is not in the line")


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
        line = s.get("line", "")
        if s.get("stage") and s["stage"] not in STAGES_OK:
            E(f"{sid}: stage '{s['stage']}' not in {sorted(STAGES_OK)}")
        for n, item in enumerate(s.get("infographic", [])):
            what = f"infographic[{n}] {item.get('kind')}"
            check_cue(sid, what, item, line, E)
            if item.get("until"):
                check_cue(sid, what + " until", item["until"], line, E)
            if item.get("slot") and item["slot"] not in SLOTS:
                E(f"{sid}: {what} slot '{item['slot']}' not in {sorted(SLOTS)}")
            if item.get("anchor") and item["anchor"] not in ANCHORS:
                E(f"{sid}: {what} anchor '{item['anchor']}' not in {sorted(ANCHORS)}")
        for n, mv in enumerate((s.get("camera") or {}).get("moves", [])):
            check_cue(sid, f"camera move {n}", mv, line, E)
        if s.get("type") == "mak_beat":
            m = effective_method(s, data)
            if s.get("method_by_plan") and data.get("plan") not in s["method_by_plan"]:
                E(f"{sid}: plan '{data.get('plan')}' not in method_by_plan {list(s['method_by_plan'])}")
            if m == "frames":
                poses = s.get("poses") or []
                if not s.get("frames"):
                    E(f"{sid}: frames beat needs 'frames' (folder)")
                if len(poses) < 2:
                    W(f"{sid}: only {len(poses)} pose(s) — TV-cartoon beats read best with 2–4 key poses")
                for n, p in enumerate(poses):
                    if not p.get("name") or not p.get("desc") or not p.get("frames"):
                        E(f"{sid}: pose {n} needs name, desc and frames")
                    if n > 0 and "at" not in p and "at_word" not in p:
                        E(f"{sid}: pose '{p.get('name')}' needs a cue (at or at_word)")
                    check_cue(sid, f"pose '{p.get('name')}'", p, line, E)
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
            if effective_method(s, data) == "frames":
                d = ep / s.get("frames", "")
                missing = [f for p in s.get("poses", []) for f in p.get("frames", []) if not (d / f).exists()]
                if missing:
                    E(f"{sid}: approved but drawings missing: {', '.join(missing[:6])}")
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
