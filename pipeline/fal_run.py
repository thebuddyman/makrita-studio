"""Run one fal model job from models.yaml: budget check → upload inputs → run → save output → log cost.

  uv run pipeline/fal_run.py image.frame --episode 001-matcha --scene s2-20-gelas \\
      --prompt-file episodes/001-matcha/qa/s2-20-gelas/prompt-003.txt \\
      --image character/mak-reference/model-sheet.png \\
      --out frames/s2-20-gelas/003.png

  uv run pipeline/fal_run.py video.hero --episode 001-matcha --scene s1-mak-marah \\
      --prompt "…" --start-image frames/s1-mak-marah/start.png --end-image frames/s1-mak-marah/end.png \\
      --duration 4 --out clips/s1-mak-marah.raw.mp4

  uv run pipeline/fal_run.py video.hero --describe        # show the job config
  … --dry-run                                            # print payload + estimate, spend nothing

Relative --out paths are inside the episode folder. Input paths are tried as given,
then inside the episode folder, then from the repo root.
Exit codes: 0 ok · 1 error · 3 budget cap would be exceeded (stop and ask a human).
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import httpx

from common import (ROOT, BudgetExceeded, check_budget, die, env, episode_dir, job_config,
                    log_cost, media_duration, rel, spent, budget)


def resolve_input(p: str, ep_dir: Path | None) -> Path:
    cands = [Path(p)]
    if ep_dir:
        cands.append(ep_dir / p)
    cands.append(ROOT / p)
    for c in cands:
        if c.exists():
            return c.resolve()
    die(f"input not found: {p}")
    raise AssertionError


def dig(result: dict, path: str) -> list[str]:
    """'images[].url' → every url; 'video.url' → [url]."""
    cur: list = [result]
    for part in path.split("."):
        nxt = []
        many = part.endswith("[]")
        key = part[:-2] if many else part
        for c in cur:
            v = c.get(key) if isinstance(c, dict) else None
            if v is None:
                continue
            nxt.extend(v if many and isinstance(v, list) else [v])
        cur = nxt
    return [u for u in cur if isinstance(u, str)]


def estimate(cfg: dict, args, ep_dir: Path | None) -> tuple[float, dict]:
    unit, usd = cfg["price"]["unit"], float(cfg["price"]["usd"])
    if unit == "image":
        n = args.n or cfg.get("defaults", {}).get("num_images", 1)
        return usd * n, {"images": n}
    if unit == "second":
        d = args.duration or 5
        return usd * d, {"seconds": d}
    if unit == "second_ceil5":
        d = media_duration(resolve_input(args.video, ep_dir)) if args.video else 5
        billed = math.ceil(d / 5) * 5
        return usd * billed / 1, {"seconds_billed": billed}  # usd is per second
    if unit == "frames30":
        d = media_duration(resolve_input(args.video, ep_dir)) if args.video else 5
        blocks = math.ceil(d * 30 / 30)
        return usd * blocks, {"frames30": blocks}
    return usd, {"calls": 1}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("job")
    ap.add_argument("--episode")
    ap.add_argument("--scene", default="")
    ap.add_argument("--prompt")
    ap.add_argument("--prompt-file")
    ap.add_argument("--image", action="append", default=[], help="reference image (repeatable)")
    ap.add_argument("--start-image")
    ap.add_argument("--end-image")
    ap.add_argument("--video")
    ap.add_argument("--audio")
    ap.add_argument("--duration", type=int)
    ap.add_argument("--n", type=int)
    ap.add_argument("--background", choices=["transparent", "opaque", "auto"])
    ap.add_argument("--set", action="append", default=[], metavar="KEY=JSON", help="extra endpoint param")
    ap.add_argument("--out", help="output path (relative → inside the episode folder)")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--describe", action="store_true")
    a = ap.parse_args()

    cfg = job_config(a.job)
    if a.describe:
        print(json.dumps(cfg, indent=2))
        return
    if not a.episode or not a.out:
        die("--episode and --out are required")

    ep_dir = episode_dir(a.episode)
    inputs: dict = cfg.get("inputs", {})
    payload: dict = dict(cfg.get("defaults", {}))

    prompt = a.prompt
    if a.prompt_file:
        prompt = resolve_input(a.prompt_file, ep_dir).read_text().strip()
    if prompt and "prompt" in inputs:
        payload[inputs["prompt"]] = prompt
    if a.n and "n" in inputs:
        payload[inputs["n"]] = a.n
    if a.background and "background" in inputs:
        payload[inputs["background"]] = a.background
    if a.duration and "duration" in inputs:
        payload[inputs["duration"]] = str(a.duration) if cfg.get("duration_type") == "string" else a.duration
    for kv in a.set:
        k, _, v = kv.partition("=")
        try:
            payload[k] = json.loads(v)
        except json.JSONDecodeError:
            payload[k] = v

    files: dict[str, list[Path] | Path] = {}
    if a.image:
        if "images" in inputs:
            files[inputs["images"]] = [resolve_input(p, ep_dir) for p in a.image]
        elif "image" in inputs:
            files[inputs["image"]] = resolve_input(a.image[0], ep_dir)
    for flag, key in (("start_image", "start_image"), ("end_image", "end_image"), ("video", "video"), ("audio", "audio")):
        val = getattr(a, flag)
        if val:
            if key not in inputs:
                die(f"job {a.job} takes no --{flag.replace('_', '-')}")
            files[inputs[key]] = resolve_input(val, ep_dir)

    est, units = estimate(cfg, a, ep_dir)
    print(f"→ {a.job} [{cfg['endpoint']}] scene={a.scene or '-'} ~${est:.3f} "
          f"(spent ${spent(a.episode):.2f} of ${budget(a.episode):.2f})")

    if a.dry_run:
        shown = {**payload, **{k: ([rel(x) for x in v] if isinstance(v, list) else rel(v)) for k, v in files.items()}}
        print(json.dumps(shown, indent=2, ensure_ascii=False))
        return

    try:
        check_budget(a.episode, est)
    except BudgetExceeded as e:
        print(f"✗ {e}", file=sys.stderr)
        sys.exit(3)

    env("FAL_KEY")
    import fal_client  # imported late so --describe/--dry-run work without a key

    for k, v in files.items():
        payload[k] = [fal_client.upload_file(str(p)) for p in v] if isinstance(v, list) else fal_client.upload_file(str(v))

    def on_update(update):
        if isinstance(update, fal_client.InProgress):
            for log in update.logs or []:
                print(f"  · {log.get('message', '')}")

    handler = fal_client.submit(cfg["endpoint"], arguments=payload)
    print(f"  request {handler.request_id}")
    for ev in handler.iter_events(with_logs=True):
        on_update(ev)
    result = handler.get()

    urls = dig(result, cfg["output"])
    if not urls:
        (ep_dir / "qa").mkdir(exist_ok=True)
        dump = ep_dir / "qa" / f"fal-{handler.request_id}.json"
        dump.write_text(json.dumps(result, indent=2))
        die(f"no output at '{cfg['output']}' — raw result saved to {rel(dump)}")

    out = Path(a.out) if Path(a.out).is_absolute() else ep_dir / a.out
    out.parent.mkdir(parents=True, exist_ok=True)
    saved = []
    for i, url in enumerate(urls):
        dst = out if len(urls) == 1 else out.with_name(f"{out.stem}-{i + 1}{out.suffix}")
        with httpx.stream("GET", url, timeout=300, follow_redirects=True) as r:
            r.raise_for_status()
            with open(dst, "wb") as f:
                for chunk in r.iter_bytes():
                    f.write(chunk)
        saved.append(rel(dst))
        print(f"✓ {rel(dst)}")

    log_cost(a.episode, job=a.job, endpoint=cfg["endpoint"], scene=a.scene, request_id=handler.request_id,
             usd=est, estimate=True, outputs=saved, **units)


if __name__ == "__main__":
    main()
