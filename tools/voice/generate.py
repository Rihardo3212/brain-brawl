"""Make Lewis's audio files with Chatterbox (see README.md in this folder).

Reads tools/voice/lines.json (made by export-lines.mjs) and writes one small Ogg/Opus file per
line to public/voice/<id>.ogg, plus public/voice/manifest.json (id -> seconds) for the game.
Lines that already have a file are skipped, so only new or changed lines are made.

  python generate.py --model PATH_TO_CHATTERBOX_MODEL [--limit N] [--clean] [--redo ID ...]
"""
import argparse, json, re, sys, time, zlib
from pathlib import Path

import numpy as np
import torch
import soundfile as sf
import librosa
import pyloudnorm

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent

# The "lively" Lewis voice. Changing these means every file should be made again (--redo-all).
VOICE = {"ref": "lewis-ref.wav", "exaggeration": 0.9, "cfg_weight": 0.35, "temperature": 0.8}
LOUDNESS = -18.0  # LUFS, similar to the game's sound effects
TRIES = 3


def expected_seconds(text):
    # Rough speaking pace for the lively voice; used to catch broken takes.
    return max(0.8, len(text) / 14.5)


def clean_audio(wav, sr, meter):
    wav, _ = librosa.effects.trim(wav, top_db=38)
    wav = np.concatenate([np.zeros(int(sr * 0.06), dtype=wav.dtype), wav, np.zeros(int(sr * 0.12), dtype=wav.dtype)])
    loud = meter.integrated_loudness(wav)
    if np.isfinite(loud):
        wav = pyloudnorm.normalize.loudness(wav, loud, LOUDNESS)
    return np.clip(wav, -0.98, 0.98).astype(np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="folder with the Chatterbox model files")
    ap.add_argument("--lines", default=str(HERE / "lines.json"))
    ap.add_argument("--out", default=str(ROOT / "public" / "voice"))
    ap.add_argument("--limit", type=int, default=0, help="only make this many new lines")
    ap.add_argument("--clean", action="store_true", help="delete files for lines that no longer exist")
    ap.add_argument("--redo", nargs="*", default=[], help="make these ids again")
    ap.add_argument("--redo-all", action="store_true")
    args = ap.parse_args()

    from chatterbox.tts import ChatterboxTTS

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    lines = json.loads(Path(args.lines).read_text(encoding="utf-8"))
    wanted = {l["id"] for l in lines}
    manifest_path = out / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    durations = manifest.get("lines", {})

    if manifest.get("voice") and manifest["voice"] != VOICE and not args.redo_all:
        sys.exit("Voice settings changed since the files were made. Run with --redo-all.")

    if args.clean:
        for f in out.glob("*.ogg"):
            if f.stem not in wanted:
                f.unlink()
                durations.pop(f.stem, None)
                print("removed", f.name)

    redo = set(args.redo) | (wanted if args.redo_all else set())
    todo = [l for l in lines if l["id"] in redo or not (out / f"{l['id']}.ogg").exists()]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{len(lines)} lines, {len(todo)} to make", flush=True)

    def save_manifest():
        keep = {k: v for k, v in durations.items() if k in wanted and (out / f"{k}.ogg").exists()}
        manifest_path.write_text(json.dumps({"voice": VOICE, "lines": dict(sorted(keep.items()))}, indent=0) + "\n")

    if not todo:
        save_manifest()
        return

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = ChatterboxTTS.from_local(args.model, device)
    ref = str(HERE / VOICE["ref"])
    model.prepare_conditionals(ref, exaggeration=VOICE["exaggeration"])
    meter = pyloudnorm.Meter(model.sr)
    print("model ready on", device, flush=True)

    start = time.time()
    for n, l in enumerate(todo, 1):
        text, lid = l["text"], l["id"]
        want = expected_seconds(text)
        best = None
        for attempt in range(TRIES):
            torch.manual_seed(zlib.crc32(lid.encode()) + attempt * 7919)
            wav = model.generate(text, exaggeration=VOICE["exaggeration"], cfg_weight=VOICE["cfg_weight"],
                                 temperature=VOICE["temperature"])
            audio = clean_audio(wav.squeeze(0).cpu().numpy(), model.sr, meter)
            secs = len(audio) / model.sr
            ratio = secs / want
            score = abs(np.log(ratio))
            if best is None or score < best[0]:
                best = (score, audio, secs)
            if 0.5 <= ratio <= 2.0:
                break
            print(f"  retry {lid}: {secs:.1f}s vs ~{want:.1f}s expected", flush=True)
        _, audio, secs = best
        sf.write(str(out / f"{lid}.ogg"), audio, model.sr, format="OGG", subtype="OPUS")
        durations[lid] = round(secs, 2)
        left = (time.time() - start) / n * (len(todo) - n)
        print(f"[{n}/{len(todo)}] {secs:4.1f}s  ~{left / 60:.0f} min left  {text[:60]}", flush=True)
        if n % 10 == 0:
            save_manifest()
    save_manifest()
    print("done", flush=True)


if __name__ == "__main__":
    main()
