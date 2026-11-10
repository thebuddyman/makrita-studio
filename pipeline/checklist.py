"""Per-episode checklist built from PROCESS.md, ticked as work gets done.

  uv run pipeline/checklist.py sync 001-matcha             # (re)build + auto-tick from files
  uv run pipeline/checklist.py tick 001-matcha vo.approved --by Steve [--note "take 2"]
  uv run pipeline/checklist.py untick 001-matcha vo.approved
  uv run pipeline/checklist.py show 001-matcha             # progress + next step

`sync` creates episodes/<id>/checklist.md if missing. Auto ticks follow the files
(and are removed if the proof goes away); human ticks are kept until `untick`.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

from common import CHARACTER, ROOT, budget, die, effective_method, episode_dir, load_models, load_scenes, media_duration, spent

PROCESS = ROOT / "PROCESS.md"
ITEM = re.compile(r"^(?P<indent>\s*)- \[(?P<x>[ xX])\] (?P<text>.*?)(?: — ✓ (?P<stamp>[^<]*?))?\s*<!-- (?P<id>[\w.\-]+) -->\s*$")
STAGES = ["draft", "generated", "qa_passed", "approved"]
DEFAULT_GATES = {"script": True, "voiceover": True, "mak": True, "final": True}
# approval items Claude may tick itself when their gate is switched off in scenes.json
GATE_ITEMS = {
    "vo.approved": ("voiceover", ["vo.generated", "vo.fits"]),
    "mak.sheet_approved": ("mak", ["mak.sheet", "mak.mouths", "mak.sets"]),
    "render.approved": ("final", ["render.final", "render.cost"]),
}


def gates(data: dict) -> dict[str, bool]:
    return {**DEFAULT_GATES, **(data.get("gates") or {})}


# ---------- template ----------

def template(ep: str, data: dict) -> list[str]:
    text = PROCESS.read_text()
    m = re.search(r"<!-- template:start -->\n(.*?)<!-- template:end -->", text, re.S)
    if not m:
        die("PROCESS.md has no <!-- template:start --> … <!-- template:end --> block")
    out: list[str] = []
    for line in m.group(1).replace("{ep}", ep).splitlines():
        if line.strip() == "<!-- scenes -->":
            for s in data["scenes"]:
                if s.get("type") != "mak_beat":
                    continue
                sid, how = s["id"], "poses drawn" if effective_method(s, data) == "frames" else "Kling hero clip made"
                out.append(f"- [ ] `{sid}` {how} <!-- scene.{sid}.generated -->")
                out.append(f"- [ ] `{sid}` QA passed <!-- scene.{sid}.qa -->")
                out.append(f"- [ ] **`{sid}` approved** — Steve <!-- scene.{sid}.approved -->")
        else:
            out.append(line)
    return out


# ---------- auto checks (None = human item) ----------

def auto_checks(ep: str, ep_dir: Path, data: dict) -> dict[str, bool]:
    scenes = data["scenes"]
    spoken = [s for s in scenes if s.get("line") and s.get("vo")]
    script = (ep_dir / "script.md").read_text() if (ep_dir / "script.md").exists() else ""
    out_final = ROOT / "out" / f"{ep}-{data.get('plan', 'chatgpt')}.mp4"

    def vo_ok(s):
        return (ep_dir / s["vo"]["file"]).exists() and (ep_dir / s["vo"]["words"]).exists()

    def final_ok() -> bool:
        if not out_final.exists():
            return False
        try:
            j = json.loads(subprocess.run(
                ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                 "stream=width,height,r_frame_rate:format=duration", "-of", "json", str(out_final)],
                capture_output=True, text=True, check=True).stdout)
            st, dur = j["streams"][0], float(j["format"]["duration"])
            return st["width"] == 1080 and st["height"] == 1920 and st["r_frame_rate"] == "30/1" and 36 <= dur <= 40.5
        except Exception:
            return False

    proto = ep_dir / "prototype"
    checks: dict[str, bool] = {
        "script.prototype": proto.is_dir() and any(p.name != "README.md" for p in proto.iterdir()),
        "script.written": "## Numbers" in script and "## Scenes" in script,
        "script.valid": subprocess.run([sys.executable, str(ROOT / "pipeline" / "validate.py"), ep],
                                       capture_output=True).returncode == 0,
        "script.approved": bool(re.search(r"^status:\s*approved\b", script, re.M)),
        "vo.voice": str(load_models()["voice"]["mak"].get("voice_id", "TODO")) not in ("", "TODO"),
        "vo.generated": bool(spoken) and all(vo_ok(s) for s in spoken),
        "vo.fits": bool(spoken) and all(vo_ok(s) and media_duration(ep_dir / s["vo"]["file"]) <= s["duration_s"]
                                        for s in spoken),
        "mak.sheet": (CHARACTER / "mak-reference" / "model-sheet.png").exists(),
        "mak.mouths": {"closed", "A", "E", "I", "O", "U", "FV", "MBP"} <= {p.stem for p in (CHARACTER / "mouth-shapes").glob("*.png")},
        "mak.qa_report": (ep_dir / "qa" / "report.md").exists(),
        "render.preview": (ROOT / "out" / f"{ep}-{data.get('plan', 'chatgpt')}-preview.mp4").exists(),
        "mak.sets": all((ROOT / "sets" / f"{s['set']}.png").exists() for s in scenes
                        if s.get("set") and not str(s["set"]).startswith("#")),
        "render.final": final_ok(),
        "render.cost": out_final.exists() and spent(ep) <= budget(ep),
        "post.notes": (ep_dir / "notes.md").exists(),
    }
    for s in scenes:
        if s.get("type") != "mak_beat":
            continue
        rank = STAGES.index(s.get("status", "draft")) if s.get("status") in STAGES else 0
        if effective_method(s, data) == "frames":
            d = ep_dir / s.get("frames", "_")
            need = [f for p in s.get("poses", []) for f in p.get("frames", [])]
            have = bool(need) and all((d / f).exists() for f in need)
        else:
            have = (ep_dir / s.get("clip", "_")).exists()
        checks[f"scene.{s['id']}.generated"] = have and rank >= 1
        checks[f"scene.{s['id']}.qa"] = have and rank >= 2
        checks[f"scene.{s['id']}.approved"] = have and rank >= 3
    g = gates(data)
    for item, (gate, needs) in GATE_ITEMS.items():
        if not g[gate]:
            checks[item] = all(checks.get(n, False) for n in needs)
    return checks


# ---------- read / write ----------

def read_state(path: Path) -> dict[str, tuple[bool, str]]:
    state = {}
    if path.exists():
        for line in path.read_text().splitlines():
            m = ITEM.match(line)
            if m:
                state[m["id"]] = (m["x"].lower() == "x", (m["stamp"] or "").strip())
    return state


def render(ep: str, lines: list[str], state: dict[str, tuple[bool, str]], data: dict) -> str:
    body, done, total, nxt = [], 0, 0, None
    for line in lines:
        m = ITEM.match(line)
        if not m:
            body.append(line)
            continue
        ticked, stamp = state.get(m["id"], (False, ""))
        total += 1
        done += ticked
        if not ticked and nxt is None:
            nxt = re.sub(r"[*`]", "", m["text"]).strip()
        suffix = f" — ✓ {stamp}" if ticked and stamp else ""
        body.append(f"{m['indent']}- [{'x' if ticked else ' '}] {m['text']}{suffix} <!-- {m['id']} -->")
    bar = "█" * round(done / max(total, 1) * 20) + "░" * (20 - round(done / max(total, 1) * 20))
    off = [k for k, v in gates(data).items() if not v]
    head = [
        f"# Checklist · {ep} · plan {data.get('plan', 'chatgpt')}" + (f" — {data.get('title')}" if data.get("title") else ""),
        "",
        f"**{done}/{total} done** `{bar}`  ",
        f"**Next:** {nxt or 'all done 🎉'}",
        "",
        f"Gates on: {', '.join(k for k, v in gates(data).items() if v) or 'none'}"
        + (f" · off (Claude approves): {', '.join(off)}" if off else ""),
        "",
        "> Kept by Claude from [PROCESS.md](../../PROCESS.md). Auto items follow the files;",
        "> approvals are ticked with who and when. Run `uv run pipeline/checklist.py sync "
        f"{ep}` to refresh.",
        "",
    ]
    return "\n".join(head + body).rstrip() + "\n"


def sync(ep: str, quiet: bool = False) -> None:
    ep_dir = episode_dir(ep)
    data = load_scenes(ep)
    path = ep_dir / "checklist.md"
    lines = template(ep, data)
    ids = [m["id"] for line in lines if (m := ITEM.match(line))]
    state = read_state(path)
    checks = auto_checks(ep, ep_dir, data)
    today = date.today().isoformat()
    changes = []
    for i in ids:
        ticked, stamp = state.get(i, (False, ""))
        if i in checks:
            human = ticked and not stamp.endswith("auto")
            if checks[i] and not ticked:
                state[i] = (True, f"{today} · {'gate off · ' if i in GATE_ITEMS else ''}auto")
                changes.append(f"✓ {i}")
            elif not checks[i] and ticked and not human:
                state[i] = (False, "")
                changes.append(f"↺ {i} (proof gone)")
        else:
            state.setdefault(i, (False, ""))
    path.write_text(render(ep, lines, state, data))
    if not quiet:
        for c in changes:
            print(f"  {c}")
        show(ep)


def tick(ep: str, item: str, by: str, note: str | None, on: bool = True) -> None:
    path = episode_dir(ep) / "checklist.md"
    if not path.exists():
        sync(ep, quiet=True)
    data = load_scenes(ep)
    lines = template(ep, data)
    ids = [m["id"] for line in lines if (m := ITEM.match(line))]
    if item not in ids:
        die(f"no item '{item}'. Items: {', '.join(ids)}")
    state = read_state(path)
    stamp = f"{date.today().isoformat()} · {by}" + (f" · {note}" if note else "")
    state[item] = (True, stamp) if on else (False, "")
    path.write_text(render(ep, lines, state, data))
    print(f"{'✓' if on else '○'} {item}" + (f" — {stamp}" if on else ""))


def show(ep: str) -> None:
    text = (episode_dir(ep) / "checklist.md").read_text()
    for line in text.splitlines()[2:4]:
        print(line.replace("**", "").replace("`", "").rstrip())


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("sync", "show"):
        p = sub.add_parser(name)
        p.add_argument("episode")
    for name in ("tick", "untick"):
        p = sub.add_parser(name)
        p.add_argument("episode")
        p.add_argument("item")
        p.add_argument("--by", default="Claude")
        p.add_argument("--note")
    a = ap.parse_args()
    if a.cmd == "sync":
        sync(a.episode)
    elif a.cmd == "show":
        if not (episode_dir(a.episode) / "checklist.md").exists():
            sync(a.episode, quiet=True)
        show(a.episode)
    else:
        tick(a.episode, a.item, a.by, a.note, on=a.cmd == "tick")


if __name__ == "__main__":
    main()
