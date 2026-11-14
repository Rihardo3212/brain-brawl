// Lewis, the presenter: plays pre-made voice clips from public/voice (see tools/voice).
// Lines play one after another. A line that waits too long is dropped, so Lewis never
// talks about something that's already over. Only the big screen uses this.

import { ac } from './sound.js';
import { duck } from './music.js';
import { voiceId, spoken } from '../content/presenter.js';

const KEY = 'bb-lewis';
const read = () => { try { return localStorage.getItem(KEY) !== '0'; } catch { return true; } };

/** Live state for the UI: is Lewis on, talking, how loud right now (mouth), what he's saying. */
export const lewis = $state({ on: read(), speaking: false, level: 0, text: '' });

export function setLewisOn(on) {
  lewis.on = on;
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch {}
  if (!on) hush();
}

const VOL = 1.0;
let manifest = null;     // id -> seconds, or {} when the files are missing
let loadingManifest = null;
const buffers = new Map(); // id -> Promise<AudioBuffer|null>

function loadManifest() {
  if (!loadingManifest) {
    loadingManifest = fetch('voice/manifest.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((m) => (manifest = m.lines || {}))
      .catch(() => (manifest = {}));
  }
  return loadingManifest;
}

/** Is there a clip for this text? (false until the manifest has loaded) */
export function hasLine(text) {
  return !!manifest && !!manifest[voiceId(text)];
}

function buffer(id) {
  if (!buffers.has(id)) {
    const c = ac();
    const p = fetch(`voice/${id}.ogg`)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .then((b) => (b && c ? c.decodeAudioData(b) : null))
      .catch(() => null);
    buffers.set(id, p);
  }
  return buffers.get(id);
}

/** Start downloading a line's clip so it plays without delay later. */
export async function preload(text) {
  await loadManifest();
  const id = voiceId(text);
  if (manifest[id]) buffer(id);
}

/* ---------- queue and playback ---------- */

let queue = [];        // { id, text, until }
let current = null;    // { src, gain }
let busy = false;
let undock = null;
let raf = 0;

function stopCurrent() {
  if (!current) return;
  const { src, gain } = current;
  current = null;
  try {
    const c = ac();
    gain.gain.setTargetAtTime(0, c.currentTime, 0.03);
    src.stop(c.currentTime + 0.12);
  } catch {}
}

/** Stop talking and forget anything queued. */
export function hush() {
  queue = [];
  stopCurrent();
}

/**
 * Say a line (fixed text from src/content/presenter.js or a question).
 * interrupt: cut off whatever Lewis is saying first.
 * maxWait: drop the line if it can't start within this many ms.
 */
export async function say(text, { interrupt = false, maxWait = 3500 } = {}) {
  if (!lewis.on || !text) return;
  const c = ac();
  if (!c || c.state !== 'running') { console.debug('[lewis] (sound off)', text); return; }
  if (interrupt) hush(); // even without a clip: the moment has moved on
  await loadManifest();
  const id = voiceId(text);
  console.debug('[lewis]', manifest[id] ? '' : '(no audio)', spoken(text));
  if (!manifest[id]) return;
  buffer(id);
  queue.push({ id, text: spoken(text), until: performance.now() + maxWait });
  pump();
}

async function pump() {
  if (busy) return;
  busy = true;
  while (queue.length) {
    const item = queue.shift();
    if (performance.now() > item.until) continue;
    const buf = await buffer(item.id);
    if (!buf || !lewis.on || performance.now() > item.until + 800) continue;
    await play(buf, item.text);
  }
  busy = false;
}

function play(buf, text) {
  const c = ac();
  return new Promise((resolve) => {
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    gain.gain.value = VOL;
    const an = c.createAnalyser();
    an.fftSize = 512;
    src.connect(gain).connect(an).connect(c.destination);

    clearTimeout(undock);
    duck(true);
    lewis.speaking = true;
    lewis.text = text;
    const data = new Float32Array(an.fftSize);
    cancelAnimationFrame(raf);
    const meter = () => {
      an.getFloatTimeDomainData(data);
      let sum = 0;
      for (const v of data) sum += v * v;
      lewis.level = Math.min(1, Math.sqrt(sum / data.length) * 5);
      raf = requestAnimationFrame(meter);
    };
    meter();

    const me = { src, gain };
    src.onended = () => {
      if (current === me) current = null;
      cancelAnimationFrame(raf);
      lewis.level = 0;
      if (!current) {
        lewis.speaking = false;
        undock = setTimeout(() => { if (!lewis.speaking) duck(false); }, 300);
      }
      resolve();
    };
    current = me;
    src.start();
  });
}
