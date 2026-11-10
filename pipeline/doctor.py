"""Check the machine is ready: tools, keys (never printed), voice id, Remotion install, character assets.

  uv run pipeline/doctor.py
"""
from __future__ import annotations

import os
import shutil
import subprocess

from common import CHARACTER, ROOT, load_models

ok_all = True


def check(label: str, ok: bool, fix: str = "") -> None:
    global ok_all
    ok_all &= ok
    print(f"{'✓' if ok else '✗'} {label}" + ("" if ok or not fix else f"  → {fix}"))


def version(cmd: list[str]) -> str:
    try:
        return subprocess.run(cmd, capture_output=True, text=True).stdout.strip().splitlines()[0]
    except Exception:
        return ""


def main() -> None:
    print("Tools")
    for tool, fix in [("node", "brew install node"), ("ffmpeg", "brew install ffmpeg"),
                      ("uv", "brew install uv"), ("git", "xcode-select --install"),
                      ("git-lfs", "brew install git-lfs && git lfs install"),
                      ("claude", "npm install -g @anthropic-ai/claude-code")]:
        check(f"{tool} {version([tool, '--version']) if shutil.which(tool) else ''}".strip(),
              bool(shutil.which(tool)), fix)
    node_major = version(["node", "--version"]).lstrip("v").split(".")[0]
    check(f"node ≥ 20 (have {node_major or '?'})", node_major.isdigit() and int(node_major) >= 20, "brew install node@20")

    print("\nKeys (.env)")
    check(".env exists", (ROOT / ".env").exists(), "cp .env.example .env")
    for k in ("FAL_KEY", "ELEVENLABS_API_KEY"):
        v = os.environ.get(k, "")
        check(f"{k} set ({len(v)} chars)" if v else f"{k} set", bool(v), "fill it in .env")

    print("\nConfig")
    m = load_models()
    vid = str(m.get("voice", {}).get("mak", {}).get("voice_id", "TODO"))
    check("Mak's ElevenLabs voice_id chosen", vid not in ("", "TODO"),
          "run /vo — Claude lists voices; put the chosen id in pipeline/config/models.yaml")
    check("remotion/node_modules installed", (ROOT / "remotion" / "node_modules").is_dir(), "cd remotion && npm install")

    print("\nCharacter (gate before any Mak beat)")
    check("character/mak-reference/model-sheet.png", (CHARACTER / "mak-reference" / "model-sheet.png").exists(),
          "/make-mak creates it on first run, then Thomas approves")
    mouths = {"closed", "A", "E", "I", "O", "U", "FV", "MBP"}
    have = {p.stem for p in (CHARACTER / "mouth-shapes").glob("*.png")}
    check(f"mouth shapes {len(have & mouths)}/8", mouths <= have, "made with the model sheet")

    print("\nAll good." if ok_all else "\nFix the ✗ items above (character items are expected before the first /make-mak).")


if __name__ == "__main__":
    main()
