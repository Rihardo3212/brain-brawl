// Party Tour: a dice board that links the other modes.
// Each round everyone rolls on their phone at once, the pieces move one by one, and the space where
// this round's chooser lands decides the next mini game: one short round of another mode.
// Mini games are scored by place (1st +500, 2nd +300...), so every mode counts the same.
// Board spaces: ⭐ bonus, 💀 trap, and passing START gives a lap bonus. Most points wins.
//
// While a mini game runs, settings.sub holds its mode id. lengthOf() then returns that mode's short
// "tour" length, and every input and tick is passed to that mode's engine. The engine's finish()
// is caught and brings the game back to the board.
import { MODES } from '../lib/modes.js';
import { shuffle } from './util.js';

export const TOUR_MODES = ['closest', 'timeline', 'pindrop', 'reflex', 'sketch', 'oddone', 'wedge', 'board'];
export const SPACES = 20;
export const T = { roll: 15000, firstRoll: 2500, step: 2600, pick: 8000, score: 7000 };
export const PLACE = [500, 300, 200, 100];
export const LAST_PLACE = 50;
export const POINTS = { bonus: 300, trap: 200, lap: 400 };
export const TOUR_PHASES = ['troll', 'tmove', 'tpick', 'tscore'];

// core.js hands over its engine list (importing it here would be circular).
let ENGINES = {};
export const setEngines = (e) => (ENGINES = e);

// The first mode space at or after this space.
export function modeAt(board, from) {
  for (let i = 0; i < board.length; i++) {
    const sp = board[(from + i) % board.length];
    if (sp?.k === 'mode') return sp.m;
  }
  return 'closest';
}

function makeBoard(players) {
  const modes = TOUR_MODES.filter((m) => players >= (MODES[m].min || 1));
  const specials = ['bonus', 'bonus', 'bonus', 'trap', 'trap'].map((k) => ({ k }));
  const nModes = SPACES - 1 - specials.length;
  const modeSpaces = [];
  while (modeSpaces.length < nModes) modeSpaces.push(...shuffle(modes));
  let rest = shuffle([...specials, ...modeSpaces.slice(0, nModes).map((m) => ({ k: 'mode', m }))]);
  // No two specials side by side, and no two same modes side by side (a few tries is plenty).
  for (let t = 0; t < 30; t++) {
    const bad = rest.some((sp, i) => i > 0 && (sp.k !== 'mode' ? rest[i - 1].k !== 'mode' : rest[i - 1].m === sp.m));
    if (!bad) break;
    rest = shuffle(rest);
  }
  return [{ k: 'start' }, ...rest];
}

// The engine for the running mini game, with finish() sending the game back to the board.
function subG(g) {
  const sg = Object.create(g);
  sg.finish = () => endSub(g);
  return sg;
}
const subEngine = (s) => (s.settings.sub ? ENGINES[s.settings.sub] : null);

function startRound(g) {
  const s = g.state;
  const t = s.tour;
  t.round += 1;
  t.rolls = {};
  t.events = {};
  t.chooser = s.unitOrder[(t.round - 1) % s.unitOrder.length];
  t.mode = null;
  t.mini = {};
  t.place = {};
  t.until = g.now() + T.roll + (t.round === 1 ? T.firstRoll : 0);
  s.phase = 'troll';
  g.save();
}

const unitsHere = (g) => g.state.unitOrder.filter((u) => g.unitHere(u));

function roll(g, from) {
  const s = g.state;
  const t = s.tour;
  const uid = g.unitOf(from);
  if (s.phase !== 'troll' || !uid || t.rolls[uid]) return;
  t.rolls[uid] = 1 + Math.floor(Math.random() * 6);
  t.rolledBy[uid] = from;
  if (unitsHere(g).every((u) => t.rolls[u])) startMove(g);
  else g.save();
}

function startMove(g) {
  const s = g.state;
  const t = s.tour;
  for (const u of s.unitOrder) if (!t.rolls[u]) t.rolls[u] = 1 + Math.floor(Math.random() * 6);
  // The chooser moves last, for suspense.
  t.moveOrder = [...s.unitOrder.filter((u) => u !== t.chooser), t.chooser];
  t.moveIdx = -1;
  nextMove(g);
}

function nextMove(g) {
  const s = g.state;
  const t = s.tour;
  t.moveIdx += 1;
  if (t.moveIdx >= t.moveOrder.length) { startPick(g); return; }
  const uid = t.moveOrder[t.moveIdx];
  const from = t.pos[uid] || 0;
  const steps = t.rolls[uid];
  const to = (from + steps) % SPACES;
  const lap = from + steps >= SPACES;
  const kind = t.board[to].k;
  let pts = 0;
  if (lap) pts += POINTS.lap;
  if (kind === 'bonus') pts += POINTS.bonus;
  const unit = s.units[uid];
  if (kind === 'trap') pts -= Math.min(POINTS.trap, unit.score + pts);
  unit.score += pts;
  t.pos[uid] = to;
  t.events[uid] = { roll: steps, from, to, lap, kind, pts };
  t.until = g.now() + T.step;
  s.phase = 'tmove';
  g.save();
}

function startPick(g) {
  const s = g.state;
  const t = s.tour;
  t.mode = modeAt(t.board, t.pos[t.chooser] || 0);
  t.until = g.now() + T.pick;
  s.phase = 'tpick';
  g.save();
}

function startSub(g) {
  const s = g.state;
  const t = s.tour;
  t.saved = {};
  for (const u of s.unitOrder) {
    t.saved[u] = s.units[u].score;
    s.units[u].score = 0; // the score bar shows this mini game's points while it runs
    s.units[u].wedges = {};
  }
  s.pscore = {};
  s.settings.sub = t.mode;
  g.mem = {};
  ENGINES[t.mode].start(subG(g));
}

function endSub(g) {
  const s = g.state;
  const t = s.tour;
  const sub = subEngine(s);
  sub?.stop?.(g);
  sub?.reset(s);
  delete s.settings.sub;
  s.turn = null;
  t.mini = {};
  t.place = {};
  for (const u of s.unitOrder) t.mini[u] = s.units[u].score;
  // Points by place; ties share a place, nothing for 0 points.
  const ranked = [...s.unitOrder].sort((a, b) => t.mini[b] - t.mini[a]);
  ranked.forEach((u, i) => {
    if (t.mini[u] <= 0) { t.place[u] = 0; return; }
    const first = ranked.findIndex((v) => t.mini[v] === t.mini[u]);
    t.place[u] = first < PLACE.length ? PLACE[first] : LAST_PLACE;
  });
  for (const u of s.unitOrder) {
    s.units[u].score = (t.saved[u] || 0) + t.place[u];
    s.units[u].wedges = {};
  }
  s.pscore = {};
  t.until = g.now() + T.score;
  s.phase = 'tscore';
  g.save();
}

function next(g) {
  const t = g.state.tour;
  if (t.round >= t.rounds) g.finish();
  else startRound(g);
}

export default {
  normalize(s) {
    s.tour = s.tour ?? null;
    if (s.tour) {
      const t = s.tour;
      for (const k of ['pos', 'rolls', 'rolledBy', 'events', 'mini', 'place', 'saved']) t[k] = t[k] || {};
      t.board = t.board || [];
      t.moveOrder = t.moveOrder || [];
      t.mode = t.mode ?? null;
    }
  },
  reset(s) {
    if (s.settings.sub) ENGINES[s.settings.sub]?.reset(s);
    delete s.settings.sub;
    s.tour = null;
  },
  start(g) {
    const s = g.state;
    const len = MODES.tour.lengths[s.settings.length] || MODES.tour.lengths.quick;
    s.tour = {
      rounds: len.rounds, round: 0, board: makeBoard(g.playersHere().length),
      pos: Object.fromEntries(s.unitOrder.map((u) => [u, 0])), rolls: {}, rolledBy: {}, events: {}, moveOrder: [], moveIdx: -1
    };
    startRound(g);
  },
  stop(g) { subEngine(g.state)?.stop?.(g); },
  input(g, from, input) {
    const s = g.state;
    if (s.settings.sub) { subEngine(s).input(subG(g), from, input); return; }
    if (input.type === 'troll') roll(g, from);
  },
  skip(g) {
    const s = g.state;
    if (s.settings.sub) { subEngine(s).skip?.(subG(g)); return; }
    if (s.phase === 'troll') startMove(g);
    else if (s.phase === 'tmove') nextMove(g);
    else if (s.phase === 'tpick') startSub(g);
    else if (s.phase === 'tscore') next(g);
  },
  tick(g, now) {
    const s = g.state;
    if (s.settings.sub) { subEngine(s).tick(subG(g), now); return; }
    const t = s.tour;
    if (!t || now < t.until) return;
    if (s.phase === 'troll') startMove(g);
    else if (s.phase === 'tmove') nextMove(g);
    else if (s.phase === 'tpick') startSub(g);
    else if (s.phase === 'tscore') next(g);
  }
};

