"""Pull 3 stills (10 %, 50 %, 90 %) from a clip for QA.

  uv run pipeline/sample_frames.py episodes/001-matcha/clips/s1-mak-marah.webm episodes/001-matcha/qa/s1-mak-marah/
"""
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

from common import ROOT, media_duration, rel, require_tool


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("out_dir")
    a = ap.parse_args()

    require_tool("ffmpeg")
    clip = Path(a.clip) if Path(a.clip).exists() else ROOT / a.clip
    out = Path(a.out_dir) if Path(a.out_dir).is_absolute() else ROOT / a.out_dir
    out.mkdir(parents=True, exist_ok=True)
    dur = media_duration(clip)
    # VP9-alpha needs the libvpx decoder to keep transparency
    dec = ["-c:v", "libvpx-vp9"] if clip.suffix == ".webm" else []
    for i, frac in enumerate((0.1, 0.5, 0.9), 1):
        dst = out / f"sample-{i}.png"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *dec, "-ss", f"{dur * frac:.3f}",
                        "-i", str(clip), "-frames:v", "1", str(dst)], check=True)
        print(f"✓ {rel(dst)}")


if __name__ == "__main__":
    main()
