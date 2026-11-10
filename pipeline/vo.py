"""Mak's voiceover + character timings (for lip sync and scene timing), straight from the ElevenLabs API.

  uv run pipeline/vo.py 001-matcha                      # every scene with a line (skips existing takes)
  uv run pipeline/vo.py 001-matcha s2-20-gelas          # one scene (always regenerates)
  uv run pipeline/vo.py 001-matcha s2-20-gelas --model eleven_multilingual_v2
  uv run pipeline/vo.py 001-matcha --test "Kenalin, Mak Rita."   # → vo/test.mp3 (smoke test)
  uv run pipeline/vo.py 001-matcha s2-20-gelas --align  # re-time an existing (e.g. hand-edited) take

Writes vo/<scene>.mp3 and vo/<scene>.words.json:
  {"text", "duration", "words": [{word,start,end}], "characters": [{char,start,end}]}
Audio tags like [sighs] are spoken as performance, never as words, so they are
stripped from the timings.
"""
from __future__ import annotations

import argparse
import base64
import json
import re
from pathlib import Path

import httpx

from common import die, env, episode_dir, find_scene, load_models, load_scenes, log_cost, media_duration, rel

API = "https://api.elevenlabs.io/v1"
TAG = re.compile(r"\[[^\]]*\]")


def strip_tags(text: str) -> str:
    return re.sub(r"\s{2,}", " ", TAG.sub("", text)).strip()


def chars_from_alignment(al: dict) -> list[dict]:
    """ElevenLabs alignment arrays → [{char,start,end}], dropping anything inside [tags]."""
    out, depth = [], 0
    for ch, s, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if ch == "[":
            depth += 1
            continue
        if ch == "]":
            depth = max(0, depth - 1)
            continue
        if depth == 0:
            out.append({"char": ch, "start": round(s, 3), "end": round(e, 3)})
    return out


def words_from_chars(chars: list[dict]) -> list[dict]:
    words, cur = [], None
    for c in chars:
        if c["char"].isspace():
            if cur:
                words.append(cur)
                cur = None
            continue
        if cur is None:
            cur = {"word": c["char"], "start": c["start"], "end": c["end"]}
        else:
            cur["word"] += c["char"]
            cur["end"] = c["end"]
    if cur:
        words.append(cur)
    return words


def headers() -> dict:
    return {"xi-api-key": env("ELEVENLABS_API_KEY")}


def tts(text: str, model_id: str, voice: dict) -> tuple[bytes, list[dict] | None]:
    body = {"text": text, "model_id": model_id, "voice_settings": voice.get("voice_settings", {})}
    if voice.get("language_code") and model_id != "eleven_multilingual_v2":
        body["language_code"] = voice["language_code"]
    params = {"output_format": voice.get("output_format", "mp3_44100_128")}
    url = f"{API}/text-to-speech/{voice['voice_id']}/with-timestamps"
    r = httpx.post(url, headers=headers(), params=params, json=body, timeout=180)
    if r.status_code == 200:
        data = r.json()
        al = data.get("alignment") or data.get("normalized_alignment")
        return base64.b64decode(data["audio_base64"]), (chars_from_alignment(al) if al else None)
    # with-timestamps refused for this model → plain TTS, timings come from forced alignment
    print(f"  with-timestamps returned {r.status_code}; falling back to plain TTS + forced alignment")
    r2 = httpx.post(f"{API}/text-to-speech/{voice['voice_id']}", headers=headers(), params=params, json=body, timeout=180)
    if r2.status_code != 200:
        die(f"ElevenLabs TTS failed {r2.status_code}: {r2.text[:400]}")
    return r2.content, None


def align(audio: Path, text: str) -> list[dict]:
    with open(audio, "rb") as f:
        r = httpx.post(f"{API}/forced-alignment", headers=headers(),
                       files={"file": (audio.name, f, "audio/mpeg")}, data={"text": text}, timeout=180)
    if r.status_code != 200:
        die(f"forced alignment failed {r.status_code}: {r.text[:400]}")
    return [{"char": c["text"], "start": round(c["start"], 3), "end": round(c["end"], 3)} for c in r.json()["characters"]]


def make_take(episode: str, ep_dir: Path, sid: str, line: str, line_tts: str, model_id: str,
              voice: dict, only_align: bool) -> float:
    mp3, words_path = ep_dir / "vo" / f"{sid}.mp3", ep_dir / "vo" / f"{sid}.words.json"
    mp3.parent.mkdir(exist_ok=True)
    if only_align:
        if not mp3.exists():
            die(f"{rel(mp3)} does not exist")
        chars = align(mp3, line)
    else:
        audio, chars = tts(line_tts, model_id, voice)
        mp3.write_bytes(audio)
        if chars is None:
            chars = align(mp3, line)
        log_cost(episode, job="vo.tts", endpoint=f"elevenlabs/{model_id}", scene=sid, usd=0,
                 characters=len(line_tts), note="inside ElevenLabs plan (credits)")
    dur = media_duration(mp3)
    words_path.write_text(json.dumps({"text": line, "duration": round(dur, 3), "words": words_from_chars(chars),
                                      "characters": chars}, indent=2, ensure_ascii=False) + "\n")
    return dur


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("episode")
    ap.add_argument("scene", nargs="?")
    ap.add_argument("--model", help="override voice.mak.model_id")
    ap.add_argument("--test", metavar="TEXT", help="one test line → vo/test.mp3")
    ap.add_argument("--align", action="store_true", help="only re-time existing takes")
    ap.add_argument("--force", action="store_true", help="regenerate takes that already exist")
    a = ap.parse_args()

    voice = load_models()["voice"]["mak"]
    if str(voice.get("voice_id", "TODO")) in ("", "TODO"):
        die("Mak's voice_id is TODO in pipeline/config/models.yaml — pick a voice first (/vo lists them).")
    model_id = a.model or voice["model_id"]
    ep_dir = episode_dir(a.episode)

    if a.test:
        dur = make_take(a.episode, ep_dir, "test", strip_tags(a.test), a.test, model_id, voice, False)
        print(f"✓ {rel(ep_dir / 'vo' / 'test.mp3')}  {dur:.2f}s")
        return

    data = load_scenes(a.episode)
    scenes = [find_scene(data, a.scene)] if a.scene else [s for s in data["scenes"] if s.get("line")]
    total = 0.0
    for s in scenes:
        sid = s["id"]
        if not a.scene and not a.force and not a.align and (ep_dir / "vo" / f"{sid}.mp3").exists():
            dur = media_duration(ep_dir / "vo" / f"{sid}.mp3")
            print(f"· {sid:<16} {dur:5.2f}s / {s['duration_s']:.1f}s  (kept; --force to redo)")
            total += dur
            continue
        line = s.get("line") or ""
        dur = make_take(a.episode, ep_dir, sid, line, s.get("line_tts") or line, model_id, voice, a.align)
        flag = "  ⚠ longer than the scene" if dur > s["duration_s"] else ""
        print(f"✓ {sid:<16} {dur:5.2f}s / {s['duration_s']:.1f}s{flag}")
        total += dur
    print(f"  spoken total {total:.1f}s")


if __name__ == "__main__":
    main()
