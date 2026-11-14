// Helpers shared by the engines and the screens.

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Loose text matching for typed answers: case, accents, punctuation,
// leading articles and a trailing plural "s" don't matter.
export function simplify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\b(a|an|the)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
export function squash(text) {
  return simplify(text).replace(/ /g, '').replace(/s$/, '');
}

export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// 'exact' | 'close' | null
export function matchGuess(guess, answers) {
  const g = squash(guess);
  if (!g) return null;
  let close = false;
  for (const a of answers) {
    const t = squash(a);
    if (g === t) return 'exact';
    const d = levenshtein(g, t);
    if (t.length >= 4 && d <= 1) close = true;
    if (t.length >= 8 && d <= 2) close = true;
  }
  return close ? 'close' : null;
}

/* ---------- drawing ---------- */

// Strokes: { c: color, w: width (on a 320px canvas), p: [x, y, x, y, ...] with x/y in 0..1000 }
export function drawStroke(ctx, st, size) {
  const p = st.p || [];
  if (p.length < 2) return;
  const k = size / 1000;
  ctx.strokeStyle = st.c;
  ctx.fillStyle = st.c;
  ctx.lineWidth = (st.w || 10) * (size / 320);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (p.length === 2) {
    ctx.beginPath();
    ctx.arc(p[0] * k, p[1] * k, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(p[0] * k, p[1] * k);
  for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i] * k, p[i + 1] * k);
  ctx.stroke();
}

export function renderStrokes(strokes, emoji) {
  const size = 320;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  const list = Object.values(strokes || {});
  if (!list.length) {
    ctx.font = '170px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji || '⭐', size / 2, size / 2 + 10);
  }
  for (const st of list) drawStroke(ctx, st, size);
  const out = document.createElement('canvas');
  out.width = out.height = 160;
  out.getContext('2d').drawImage(cv, 0, 0, 160, 160);
  return out.toDataURL('image/png');
}
