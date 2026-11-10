"""Generate one image with Codex CLI's built-in $imagegen (GPT Image 2) on the ChatGPT plan.

No API key: Codex must be logged in with ChatGPT (`codex login`, choose "Sign in
with ChatGPT"). Each image uses ChatGPT plan quota (shared with your normal
ChatGPT/Codex use) and takes roughly 40-90 s. Run images one at a time.

Called by pipeline/run_model.py for jobs with `backend: codex`; can also be run
directly:

  uv run pipeline/codex_image.py --prompt "…" --image character/mak-reference/model-sheet.png \\
      --out episodes/001-matcha/frames/s2-20-gelas/001.png --background transparent

Transparency: Codex is asked for a flat key-colour background, which is then keyed
out locally with FFmpeg (free). Use --key-color 0x0000FF (blue) when the image
has something green in it (e.g. Mak holding a matcha).
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

from common import ROOT, die, rel, require_tool

CODEX_HOME = Path.home() / ".codex"
GENERATED = CODEX_HOME / "generated_images"
KEY_NAMES = {"0x00FF00": "pure green #00FF00", "0x0000FF": "pure blue #0000FF"}


def check_login() -> None:
    require_tool("codex")
    out = subprocess.run(["codex", "login", "status"], capture_output=True, text=True)
    status = (out.stdout + out.stderr).strip()
    if "ChatGPT" not in status:
        die(f"Codex is not logged in with ChatGPT ({status or 'no status'}). Run: codex login")


def _pngs() -> dict[Path, float]:
    if not GENERATED.exists():
        return {}
    return {p: p.stat().st_mtime for p in GENERATED.rglob("*") if p.suffix.lower() in (".png", ".webp", ".jpg", ".jpeg")}


def generate(prompt: str, refs: list[Path], out: Path, background: str = "opaque",
             size: tuple[int, int] = (1024, 1024), key_color: str = "0x00FF00", timeout: int = 600) -> Path:
    check_login()
    require_tool("ffmpeg")
    out = out.resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="codex-img-", dir=out.parent) as tmp:
        tmp_dir = Path(tmp)
        raw = tmp_dir / "raw.png"
        bg_line = (f"Background: a completely flat, solid {KEY_NAMES.get(key_color, key_color)} fill edge to edge — "
                   "no shadow, no floor, no gradient, no texture, and do not use that colour anywhere on the subject."
                   if background == "transparent" else "Background: as described in the prompt.")
        task = "\n".join([
            "$imagegen Generate exactly ONE image.",
            prompt.strip(),
            f"Aspect ratio {size[0]}:{size[1]}.",
            bg_line,
            "The attached images are the character reference: match the character's design exactly." if refs else "",
            "No text, letters, numbers, logos or watermarks anywhere in the image.",
            f"When it is generated, save the PNG to exactly this path: {raw}",
            "Do not create or change any other file. Do not write code. Reply with only: DONE",
        ])

        before = _pngs()
        cmd = ["codex", "exec", "--skip-git-repo-check", "-s", "workspace-write", "-C", str(tmp_dir),
               "--enable", "image_generation", "-o", str(tmp_dir / "last.txt")]
        for r in refs:
            cmd += ["-i", str(r.resolve())]
        cmd.append(task)

        t0 = time.time()
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        took = time.time() - t0

        src = raw if raw.exists() else None
        if src is None:  # Codex didn't copy it: take the newest image it generated during this run
            new = [p for p, m in _pngs().items() if p not in before or m > before[p]]
            if new:
                src = max(new, key=lambda p: p.stat().st_mtime)
        if src is None:
            tail = (proc.stdout + proc.stderr).strip().splitlines()[-15:]
            die("Codex produced no image. Last output:\n  " + "\n  ".join(tail) +
                "\n(Plan limit reached? Try again later, or use the paid fal job image.frame_fal.)")

        w, h = size
        scale = f"scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih):color={key_color}"
        if background == "transparent":
            ch = "green" if key_color.upper() == "0X00FF00" else "blue"
            vf = f"{scale},chromakey={key_color}:0.12:0.04,despill=type={ch},format=rgba"
        else:
            vf = scale.replace(f":color={key_color}", ":color=white")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-vf", vf, "-frames:v", "1", str(out)],
                       check=True)
        # keep the untouched original next to QA material for re-keying
        keep = out.with_suffix(".codex-original.png")
        shutil.copy2(src, keep)

    print(f"✓ {rel(out)}  ({took:.0f}s, ChatGPT plan)")
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--prompt")
    ap.add_argument("--prompt-file")
    ap.add_argument("--image", action="append", default=[])
    ap.add_argument("--out", required=True)
    ap.add_argument("--background", choices=["transparent", "opaque"], default="opaque")
    ap.add_argument("--size", default="1024x1024")
    ap.add_argument("--key-color", default="0x00FF00")
    a = ap.parse_args()

    prompt = Path(a.prompt_file).read_text() if a.prompt_file else a.prompt
    if not prompt:
        die("--prompt or --prompt-file is required")
    refs = [Path(p) if Path(p).exists() else ROOT / p for p in a.image]
    for r in refs:
        if not r.exists():
            die(f"reference not found: {r}")
    w, h = (int(x) for x in a.size.lower().split("x"))
    out = Path(a.out) if Path(a.out).is_absolute() else ROOT / a.out
    generate(prompt, refs, out, a.background, (w, h), a.key_color)


if __name__ == "__main__":
    main()
