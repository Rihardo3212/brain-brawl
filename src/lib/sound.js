// Small synthesized sound effects (no audio files needed).

let ctx = null;
let muted = localStorage.getItem('bb-muted') === '1';

export function isMuted() { return muted; }
export function setMuted(m) {
  muted = m;
  localStorage.setItem('bb-muted', m ? '1' : '0');
}

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Call on the first tap so browsers allow sound later.
export function unlockAudio() { ac(); }

function tone(freq, start, dur, type = 'sine', vol = 0.18, slideTo = null) {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  pop: () => tone(660, 0, 0.12, 'triangle', 0.2, 990),
  join: () => { tone(523, 0, 0.12, 'triangle'); tone(784, 0.1, 0.18, 'triangle'); },
  pick: () => { tone(392, 0, 0.1, 'square', 0.08); tone(587, 0.08, 0.15, 'square', 0.08); },
  buzz: () => tone(180, 0, 0.35, 'sawtooth', 0.14, 120),
  open: () => tone(880, 0, 0.08, 'sine', 0.12),
  correct: () => { tone(523, 0, 0.12, 'triangle'); tone(659, 0.1, 0.12, 'triangle'); tone(1047, 0.2, 0.3, 'triangle'); },
  wrong: () => { tone(220, 0, 0.18, 'square', 0.1); tone(165, 0.16, 0.3, 'square', 0.1); },
  tick: () => tone(1200, 0, 0.04, 'sine', 0.06),
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.22, 'triangle', 0.16))
};
