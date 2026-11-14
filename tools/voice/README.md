# Lewis's voice

Lewis, the presenter, speaks from pre-made audio files in `public/voice/` (Ogg/Opus, ~4 KB per second).
The game looks each line up by an id made from its text (`voiceId()` in `src/content/presenter.js`),
so a line without a file simply stays silent.

The files are made on a PC with [Chatterbox](https://github.com/resemble-ai/chatterbox) (MIT).
`lewis-ref.wav` is the voice Chatterbox copies: a synthetic voice made with Kokoro (`bm_lewis`, Apache-2.0),
not a real person.

## After adding questions or lines

```bash
node tools/voice/export-lines.mjs
python tools/voice/generate.py --model PATH/TO/chatterbox-model --clean
```

Only new or changed lines are made (about 10 s each on a GPU). `--clean` removes files for lines that are gone.
Commit `public/voice/` and `tools/voice/lines.json` together.

## One-time setup

1. Python 3.12 in its own virtual environment.
2. PyTorch for your GPU (AMD on Windows: AMD's ROCm wheels, NVIDIA: the CUDA wheels, or CPU, which is slow).
3. `pip install --no-deps chatterbox-tts==0.1.7`, then its dependencies without torch:
   `numpy<2 librosa==0.11.0 s3tokenizer transformers==5.2.0 diffusers==0.29.0 resemble-perth conformer==0.3.2 safetensors==0.5.3 spacy-pkuseg pykakasi==2.3.0 pyloudnorm omegaconf "setuptools<81"`
4. Download these files from the `ResembleAI/chatterbox` model on Hugging Face into one folder:
   `ve.safetensors`, `t3_cfg.safetensors`, `s3gen.safetensors`, `tokenizer.json`, `conds.pt`.

## Settings

`VOICE` in `generate.py` holds the "lively" setting (exaggeration 0.9, cfg 0.35). If you change it,
run with `--redo-all` so every line sounds the same. A take that is much shorter or longer than expected
is made again (up to 3 tries). To redo a single bad line: `--redo <id>` (ids are in `lines.json`).
