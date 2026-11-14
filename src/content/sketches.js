// Memory Sketch figures. Everything is built from strokes on a 1000 × 1000 grid
// (same format as Doodle Dash drawings). Two kinds:
//   - ICONS: simple pictures (house, fish…), diff 1–3
//   - random abstract figures made of 2–5 basic shapes, made from a seed so every screen draws the same one

const W = 12;
const INK = '#2b2240';
const S = (p) => ({ c: INK, w: W, p: p.map(Math.round) });

// ---------- building blocks ----------
export function circle(cx, cy, r, from = 0, to = 360, ry = r) {
  const p = [];
  const steps = Math.max(8, Math.round(Math.abs(to - from) / 10));
  for (let i = 0; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    p.push(cx + Math.cos(a) * r, cy + Math.sin(a) * ry);
  }
  return S(p);
}
export const poly = (pts, closed = false) => S(closed ? [...pts, pts[0], pts[1]] : pts);
export const line = (x1, y1, x2, y2) => S([x1, y1, x2, y2]);
const rect = (x, y, w, h) => poly([x, y, x + w, y, x + w, y + h, x, y + h], true);
const dot = (x, y) => S([x, y]);
function star(cx, cy, r, points = 5, inner = 0.45) {
  const p = [];
  for (let i = 0; i <= points * 2; i++) {
    const a = (i * Math.PI) / points - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
    p.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  return S(p);
}
function heart(cx, cy, size) {
  const p = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    p.push(cx + (x * size) / 17, cy + (y * size) / 17);
  }
  return S(p);
}
function zigzag(x, y, w, h, n = 4) {
  const p = [];
  for (let i = 0; i <= n * 2; i++) p.push(x + (w * i) / (n * 2), y + (i % 2 ? h : 0));
  return S(p);
}
function wave(x, y, w, h, n = 2) {
  const p = [];
  for (let i = 0; i <= 40; i++) p.push(x + (w * i) / 40, y + Math.sin((i / 40) * Math.PI * 2 * n) * h);
  return S(p);
}
function spiral(cx, cy, r, turns = 2.5) {
  const p = [];
  const steps = Math.round(turns * 36);
  for (let i = 0; i <= steps; i++) {
    const a = (i / 36) * Math.PI * 2;
    const rr = (r * i) / steps;
    p.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  return S(p);
}

// ---------- icons ----------
export const ICONS = [
  { id: 'house', name: 'House', diff: 1, s: () => [rect(260, 460, 480, 380), poly([200, 480, 500, 200, 800, 480]), rect(440, 640, 120, 200)] },
  { id: 'smiley', name: 'Smiley', diff: 1, s: () => [circle(500, 500, 330), dot(390, 420), dot(610, 420), circle(500, 520, 180, 20, 160)] },
  { id: 'star', name: 'Star', diff: 1, s: () => [star(500, 520, 360)] },
  { id: 'heart', name: 'Heart', diff: 1, s: () => [heart(500, 520, 330)] },
  { id: 'sun', name: 'Sun', diff: 1, s: () => [circle(500, 500, 170), ...Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return line(500 + Math.cos(a) * 240, 500 + Math.sin(a) * 240, 500 + Math.cos(a) * 360, 500 + Math.sin(a) * 360); })] },
  { id: 'fish', name: 'Fish', diff: 1, s: () => [circle(450, 500, 260, 0, 360, 160), poly([700, 500, 860, 380, 860, 620], true), dot(330, 460)] },
  { id: 'tree', name: 'Tree', diff: 1, s: () => [circle(500, 380, 250), rect(450, 620, 100, 260)] },
  { id: 'moon', name: 'Moon and star', diff: 1, s: () => [circle(430, 500, 280, 60, 300), circle(560, 500, 220, 110, 250), star(720, 300, 90)] },
  { id: 'cloud', name: 'Rain cloud', diff: 2, s: () => [circle(380, 420, 140, 90, 270), circle(520, 340, 170, 180, 360), circle(680, 430, 130, 270, 450), line(380, 560, 690, 560), line(400, 640, 370, 720), line(520, 640, 490, 720), line(640, 640, 610, 720)] },
  { id: 'bolt', name: 'Lightning bolt', diff: 1, s: () => [poly([560, 120, 320, 540, 500, 540, 420, 880, 700, 420, 520, 420, 620, 120], true)] },
  { id: 'umbrella', name: 'Umbrella', diff: 2, s: () => [circle(500, 480, 340, 180, 360), line(160, 480, 840, 480), line(500, 480, 500, 800), circle(440, 800, 60, 0, 180)] },
  { id: 'cup', name: 'Mug', diff: 1, s: () => [rect(300, 360, 320, 400), circle(620, 560, 110, 270, 450), wave(340, 250, 80, 30, 1), wave(480, 250, 80, 30, 1)] },
  { id: 'mail', name: 'Envelope', diff: 1, s: () => [rect(220, 300, 560, 400), poly([220, 300, 500, 520, 780, 300])] },
  { id: 'flower', name: 'Flower', diff: 2, s: () => [circle(500, 360, 70), ...Array.from({ length: 6 }, (_, i) => { const a = (i * Math.PI) / 3; return circle(500 + Math.cos(a) * 140, 360 + Math.sin(a) * 140, 70); }), line(500, 430, 500, 880), circle(570, 700, 70, 180, 360, 35)] },
  { id: 'ghost', name: 'Ghost', diff: 2, s: () => [S([280, 820, 280, 450]), circle(500, 450, 220, 180, 360), S([720, 450, 720, 820]), zigzag(280, 820, 440, -60, 3), dot(430, 430), dot(570, 430)] },
  { id: 'snowman', name: 'Snowman', diff: 2, s: () => [circle(500, 700, 200), circle(500, 360, 140), dot(450, 330), dot(550, 330), line(500, 370, 590, 395), dot(500, 640), dot(500, 740)] },
  { id: 'icecream', name: 'Ice cream', diff: 1, s: () => [circle(500, 360, 200, 180, 360), line(300, 360, 700, 360), poly([300, 360, 500, 880, 700, 360]), line(400, 480, 600, 480)] },
  { id: 'key', name: 'Key', diff: 2, s: () => [circle(300, 500, 130), line(430, 500, 860, 500), line(760, 500, 760, 600), line(840, 500, 840, 580)] },
  { id: 'boat', name: 'Sailboat', diff: 2, s: () => [poly([220, 640, 780, 640, 690, 780, 310, 780], true), line(500, 640, 500, 180), poly([500, 200, 740, 560, 500, 560])] },
  { id: 'balloon', name: 'Balloon', diff: 1, s: () => [circle(500, 380, 220, 0, 360, 260), poly([480, 640, 520, 640, 500, 680], true), S([500, 680, 470, 760, 530, 830, 490, 900])] },
  { id: 'mushroom', name: 'Mushroom', diff: 2, s: () => [circle(500, 520, 320, 180, 360, 260), line(180, 520, 820, 520), rect(410, 520, 180, 300), dot(400, 380), dot(560, 330), dot(650, 440)] },
  { id: 'crown', name: 'Crown', diff: 1, s: () => [poly([220, 720, 220, 320, 360, 520, 500, 280, 640, 520, 780, 320, 780, 720], true), line(220, 640, 780, 640)] },
  { id: 'eye', name: 'Eye', diff: 2, s: () => [circle(500, 700, 380, 225, 315), circle(500, 300, 380, 45, 135), circle(500, 500, 110), dot(500, 500)] },
  { id: 'rocket', name: 'Rocket', diff: 3, s: () => [poly([420, 760, 420, 380, 500, 180, 580, 380, 580, 760], true), circle(500, 440, 50), poly([420, 600, 320, 760, 420, 760]), poly([580, 600, 680, 760, 580, 760]), zigzag(440, 790, 120, 70, 2)] },
  { id: 'car', name: 'Car', diff: 3, s: () => [poly([140, 640, 140, 520, 300, 520, 380, 400, 640, 400, 720, 520, 860, 520, 860, 640], true), circle(300, 660, 80), circle(700, 660, 80), line(510, 400, 510, 520)] },
  { id: 'cat', name: 'Cat face', diff: 3, s: () => [circle(500, 540, 280), poly([280, 380, 300, 160, 430, 280]), poly([570, 280, 700, 160, 720, 380]), dot(410, 500), dot(590, 500), poly([470, 580, 530, 580, 500, 620], true), line(400, 620, 220, 590), line(400, 650, 220, 680), line(600, 620, 780, 590), line(600, 650, 780, 680)] },
  { id: 'glasses', name: 'Glasses', diff: 2, s: () => [circle(330, 520, 140), circle(670, 520, 140), circle(500, 520, 60, 200, 340), line(190, 500, 100, 420), line(810, 500, 900, 420)] },
  { id: 'arrowsign', name: 'Signpost', diff: 2, s: () => [line(500, 200, 500, 880), poly([300, 260, 700, 260, 780, 330, 700, 400, 300, 400], true), poly([700, 470, 300, 470, 220, 540, 300, 610, 700, 610], true)] },
  { id: 'snail', name: 'Snail', diff: 3, s: () => [spiral(520, 520, 220, 2.2), S([200, 760, 820, 760, 840, 700]), line(260, 760, 220, 560), line(220, 560, 180, 480), line(250, 600, 300, 500)] },
  { id: 'gift', name: 'Present', diff: 2, s: () => [rect(250, 420, 500, 420), rect(220, 330, 560, 90), line(500, 330, 500, 840), circle(430, 280, 70, 0, 360, 45), circle(570, 280, 70, 0, 360, 45)] }
];

// ---------- random abstract figures ----------
// A small seeded random generator, so the host, the TV and the phones all build the same figure.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function abstractFigure(seed, n) {
  const r = rng(seed);
  const between = (a, b) => a + r() * (b - a);
  const out = [];
  const kinds = ['circle', 'square', 'triangle', 'line', 'zigzag', 'wave', 'cross', 'star'];
  for (let i = 0; i < n; i++) {
    const k = kinds[Math.floor(r() * kinds.length)];
    const size = between(120, 260);
    const cx = between(150 + size / 2, 850 - size / 2);
    const cy = between(150 + size / 2, 850 - size / 2);
    if (k === 'circle') out.push(circle(cx, cy, size / 2));
    if (k === 'square') out.push(rect(cx - size / 2, cy - size / 2, size, size));
    if (k === 'triangle') out.push(poly([cx, cy - size / 2, cx + size / 2, cy + size / 2, cx - size / 2, cy + size / 2], true));
    if (k === 'line') { const a = r() * Math.PI; out.push(line(cx - Math.cos(a) * size, cy - Math.sin(a) * size, cx + Math.cos(a) * size, cy + Math.sin(a) * size)); }
    if (k === 'zigzag') out.push(zigzag(cx - size, cy - size / 4, size * 2, size / 2, 3));
    if (k === 'wave') out.push(wave(cx - size, cy, size * 2, size / 3, 2));
    if (k === 'cross') out.push(line(cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2), line(cx + size / 2, cy - size / 2, cx - size / 2, cy + size / 2));
    if (k === 'star') out.push(star(cx, cy, size / 2));
  }
  return out;
}

// target: { kind: 'icon', id } or { kind: 'abs', seed, n }
export function figureFor(target) {
  if (!target) return [];
  if (target.kind === 'icon') return ICONS.find((i) => i.id === target.id)?.s() || [];
  return abstractFigure(target.seed, target.n);
}
export const figureName = (target) => (target?.kind === 'icon' ? ICONS.find((i) => i.id === target.id)?.name : 'Mystery shapes');
