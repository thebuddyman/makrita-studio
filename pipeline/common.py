"""Shared helpers: paths, .env, scenes.json, models.yaml, the cost ledger and budget cap."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
EPISODES = ROOT / "episodes"
CHARACTER = ROOT / "character"
MODELS_FILE = ROOT / "pipeline" / "config" / "models.yaml"

load_dotenv(ROOT / ".env")

STATUSES = ["draft", "generated", "qa_passed", "approved"]


class BudgetExceeded(RuntimeError):
    pass


def die(msg: str, code: int = 1) -> None:
    print(f"✗ {msg}", file=sys.stderr)
    sys.exit(code)


def env(name: str) -> str:
    val = os.environ.get(name, "").strip()
    if not val:
        die(f"{name} is not set. Copy .env.example to .env and fill it in.")
    return val


# ---------- episodes ----------

def episode_dir(episode: str) -> Path:
    d = EPISODES / episode
    if not d.is_dir():
        die(f"No episode folder {d.relative_to(ROOT)}")
    return d


def load_scenes(episode: str) -> dict:
    return json.loads((episode_dir(episode) / "scenes.json").read_text())


def save_scenes(episode: str, data: dict) -> None:
    path = episode_dir(episode) / "scenes.json"
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def effective_method(scene: dict, data: dict) -> str | None:
    """'frames' or 'i2v' for the episode's active test plan (scenes.json "plan")."""
    by_plan = scene.get("method_by_plan") or {}
    return by_plan.get(data.get("plan", "")) or scene.get("method") or by_plan.get("chatgpt")


def find_scene(data: dict, scene_id: str) -> dict:
    for s in data["scenes"]:
        if s["id"] == scene_id:
            return s
    die(f"No scene '{scene_id}' in {data.get('episode')}. Ids: {', '.join(s['id'] for s in data['scenes'])}")
    raise AssertionError


# ---------- models ----------

def load_models() -> dict:
    return yaml.safe_load(MODELS_FILE.read_text())


def job_config(job: str) -> dict:
    jobs = load_models()["jobs"]
    if job not in jobs:
        die(f"Unknown job '{job}'. Jobs in models.yaml: {', '.join(jobs)}")
    return jobs[job]


# ---------- cost ledger ----------

def _cost_path(episode: str) -> Path:
    return episode_dir(episode) / "cost.json"


def load_cost(episode: str) -> dict:
    p = _cost_path(episode)
    if not p.exists():
        return {"episode": episode, "currency": "USD", "entries": []}
    return json.loads(p.read_text())


def spent(episode: str) -> float:
    return round(sum(e.get("usd", 0) for e in load_cost(episode)["entries"]), 4)


def budget(episode: str) -> float:
    return float(load_scenes(episode).get("budget_usd", 0))


def check_budget(episode: str, estimate_usd: float) -> None:
    cap, used = budget(episode), spent(episode)
    if used + estimate_usd > cap + 1e-9:
        raise BudgetExceeded(
            f"This run (~${estimate_usd:.2f}) would take {episode} to ${used + estimate_usd:.2f}, "
            f"over the ${cap:.2f} cap. Stop and ask a human."
        )


def log_cost(episode: str, **entry) -> None:
    data = load_cost(episode)
    entry = {"at": datetime.now(timezone.utc).isoformat(timespec="seconds"), **entry}
    entry["usd"] = round(float(entry.get("usd", 0)), 4)
    data["entries"].append(entry)
    _cost_path(episode).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


# ---------- media ----------

def require_tool(name: str) -> str:
    path = shutil.which(name)
    if not path:
        die(f"'{name}' is not installed (brew install {name}).")
    return path


def media_duration(path: Path) -> float:
    require_tool("ffprobe")
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return float(out)


def rel(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path)
