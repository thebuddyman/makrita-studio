"""Key out the flat green background of a hero clip → WebM (VP9) with alpha.

  uv run pipeline/chroma.py clips/s1.lipsync.mp4 clips/s1.webm [--similarity 0.15 --blend 0.08]

Paths may be relative to the repo root or to the current folder.
"""
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

from common import ROOT, die, rel, require_tool


def resolve(p: str) -> Path:
    path = Path(p)
    return path if path.is_absolute() or path.exists() else ROOT / p


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--color", default="0x00FF00")
    ap.add_argument("--similarity", type=float, default=0.15)
    ap.add_argument("--blend", type=float, default=0.08)
    a = ap.parse_args()

    require_tool("ffmpeg")
    src, dst = resolve(a.src), resolve(a.dst)
    if not src.exists():
        die(f"{a.src} not found")
    dst.parent.mkdir(parents=True, exist_ok=True)
    vf = f"chromakey={a.color}:{a.similarity}:{a.blend},despill=type=green,format=yuva420p"
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-vf", vf,
           "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0", "-b:v", "4M",
           "-c:a", "libopus", str(dst)]
    subprocess.run(cmd, check=True)
    print(f"✓ {rel(dst)}")


if __name__ == "__main__":
    main()
