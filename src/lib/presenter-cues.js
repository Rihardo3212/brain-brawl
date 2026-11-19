// When Lewis speaks: compares the previous and next game state (like the sound effects in
// Host.svelte) and picks a line. In host mode a real person reads the questions, so Lewis
// only does the jokes.

import { say, hush, preload, lewis } from './presenter.svelte.js';
import { line, placeLine } from '../content/presenter.js';
import { placeById } from '../engine/pindrop.js';

const count = (o) => Object.keys(o || {}).length;
const chance = (p) => Math.random() < p;

// Team name for team games, null for solo (solo lines never say names).
const teamOf = (s, uid) => (s.teamMode && uid ? s.units[uid]?.name || null : null);
const byUnit = (s, uid, solo, team) => {
  const t = teamOf(s, uid);
  return t ? line(team, t) : line(solo);
};

function read(s, text, opts = {}) {
  if (s.mode === 'host' || !text) return;
  say(text, { interrupt: true, maxWait: 2500, ...opts });
}

export function lewisReact(a, b) {
  if (!b || !a) return;

  // Lobby: greet new players now and then.
  if (b.phase === 'lobby' && b.order.length > a.order.length) {
    if (a.order.length === 0) say(line('lobbyFirst'));
    else if (chance(0.5)) say(line('lobbyJoin'), { maxWait: 1500 });
  }

  if (a.phase !== b.phase) phase(a, b);
  else step(a, b);
}

function phase(a, b) {
  switch (b.phase) {
    case 'lobby': hush(); break;
    case 'teamdraw': say(line('teamDraw'), { interrupt: true }); break;
    case 'intro':
      say(line('welcome'), { interrupt: true });
      say(line(`intro_${b.settings.game}`), { maxWait: 14000 });
      break;

    // Brain Board
    case 'board':
      say(byUnit(b, b.turn, 'pick', 'pickTeam'), { maxWait: a.phase === 'reveal' ? 3000 : 6000 });
      break;
    case 'question':
      if (a.phase === 'answer') say(line('wrong'), { interrupt: true });
      else read(b, b.current?.q);
      break;
    case 'answer':
      say(byUnit(b, b.current?.buzzUnit, 'buzz', 'buzzTeam'), { interrupt: true });
      break;
    case 'reveal': {
      const c = b.current;
      if (c?.result === 'correct') say(byUnit(b, c.winner, 'correct', 'correctTeam'), { interrupt: true });
      else say(line(c?.wrongs?.length ? 'nobody' : 'timeUp'), { interrupt: true });
      break;
    }
    case 'finalBet': say(line('finalBet'), { interrupt: true }); break;
    case 'finalQ': read(b, b.final?.q); break;
    case 'finalReveal': say(line('finalReveal'), { interrupt: true }); break;

    // Wedge Rush
    case 'spin': if (chance(0.6)) say(line('spin'), { interrupt: true }); break;
    case 'wq': {
      const q = b.wedge?.q;
      if (!q) break;
      if (q.type === 'num') { say(line('numeric'), { interrupt: true }); read(b, q.text, { interrupt: false, maxWait: 4000 }); }
      else read(b, q.text);
      break;
    }
    case 'wreveal': {
      const w = b.wedge;
      if (w?.winner) say(byUnit(b, w.winner, 'wedgeWin', 'wedgeWinTeam'), { interrupt: true });
      else say(line('wedgeNone'), { interrupt: true });
      break;
    }

    // Fake Out
    case 'lie':
      read(b, b.fake?.text);
      say(line('lie'), { maxWait: b.mode === 'host' ? 3000 : 12000 });
      break;
    case 'pick': say(line('fakePick'), { interrupt: true }); break;

    // Doodle Dash
    case 'dchoose': say(line('doodleChoose'), { interrupt: true }); break;
    case 'ddraw': say(line('doodleGo'), { interrupt: true }); break;
    case 'dreveal':
      say(line(count(b.doodle?.guessed) ? 'doodleReveal' : 'doodleNobody'), { interrupt: true });
      break;

    // Pin Drop
    case 'pguess': say(line(b.pin?.double ? 'pinDouble' : 'pinGo'), { interrupt: true }); break;
    case 'preveal': {
      const p = b.pin;
      const place = placeById(p?.id);
      const bullseye = Object.values(p?.results || {}).some((r) => r.km <= 25);
      if (place) preload(placeLine(place));
      say(line(bullseye ? 'pinBullseye' : 'pinReveal'), { interrupt: true });
      if (place) say(placeLine(place), { maxWait: 6000 });
      break;
    }

    // Closest Call
    case 'cguess':
      say(line(b.close?.double ? 'closeDouble' : 'closeGo'), { interrupt: true, maxWait: 2000 });
      read(b, b.close?.q, { interrupt: false, maxWait: 5000 });
      break;
    case 'creveal': {
      const spot = Object.values(b.close?.results || {}).some((r) => r.spot);
      say(line(spot ? 'closeSpot' : 'closeReveal'), { interrupt: true });
      break;
    }

    // Timeline
    case 'tguess': if (b.line?.round === 1 || chance(0.35)) say(line('lineGo'), { interrupt: true }); break;
    case 'treveal': {
      const perfect = Object.values(b.line?.results || {}).some((r) => r.perfect);
      say(line(perfect ? 'linePerfect' : 'lineReveal'), { interrupt: true });
      break;
    }

    // Who Wrote That?
    case 'wwrite':
      read(b, b.who?.prompt);
      say(line('whoWrite'), { maxWait: 6000 });
      break;
    case 'wguess': if (b.who?.idx === 0 || chance(0.3)) say(line('whoGuess'), { interrupt: true }); break;
    case 'wshow': {
      const w = b.who;
      const right = Object.values(w?.guesses || {}).filter((p) => p === w.author).length;
      if (!right && count(w?.guesses)) say(line('whoFooled'), { interrupt: true });
      else if (right && chance(0.6)) say(line('whoRight'), { interrupt: true });
      break;
    }

    // Odd One Out
    case 'oclue': say(line('oddClue'), { interrupt: true }); break;
    case 'ovote': say(line('oddVote'), { interrupt: true }); break;
    case 'oguess': say(line('oddCaught'), { interrupt: true }); break;
    case 'oresult': {
      const o = b.odd;
      if (!o) break;
      const away = o.spies.some((p) => !o.caught.includes(p));
      const stole = Object.keys(o.stole || {}).length;
      say(line(away ? 'oddEscaped' : stole ? 'oddStole' : 'oddWin'), { interrupt: true });
      break;
    }

    // Scribble Chain
    case 'scwrite': say(line('scWrite'), { interrupt: true }); break;
    case 'scdraw': say(line('scDraw'), { interrupt: true }); break;
    case 'scdesc': say(line('scDesc'), { interrupt: true }); break;
    case 'scshow': if (b.chain?.showIdx === 0 || chance(0.4)) say(line('scShow'), { interrupt: true, maxWait: 1500 }); break;
    case 'scvote': if (b.chain?.showIdx === 0 || chance(0.3)) say(line('scVote'), { interrupt: true }); break;

    // Memory Sketch
    case 'mlook': if (b.sketch?.round === 1 || chance(0.4)) say(line('memLook'), { interrupt: true, maxWait: 800 }); break;
    case 'mdraw': if (b.sketch?.round === 1 || chance(0.4)) say(line('memDraw'), { interrupt: true }); break;
    case 'mreveal': {
      const great = Object.values(b.sketch?.results || {}).some((r) => r.pts >= 800);
      say(line(great ? 'memGreat' : 'memReveal'), { interrupt: true });
      break;
    }

    // Reflex Rumble: explain each mini game before it starts, never during it.
    case 'rready': if (b.reflex?.game) say(line(`reflex_${b.reflex.game}`), { interrupt: true, maxWait: 1000 }); break;
    case 'rgo': hush(); break;
    case 'rresult': if (chance(0.5)) say(line('reflexWin'), { interrupt: true }); break;

    // Party Tour
    case 'troll': if (b.tour?.round === 1 || chance(0.4)) say(line('tourRoll'), { interrupt: true }); break;
    case 'tmove': tourMove(b); break;
    case 'tpick': if (b.tour?.mode) say(line(`tourPick_${b.tour.mode}`), { interrupt: true }); break;
    case 'tscore': if (chance(0.5)) say(line('tourScore'), { interrupt: true }); break;

    case 'end': {
      const r = b.results;
      if (!r) break;
      hush();
      setTimeout(() => {
        if (r.winners.length > 1) say(line('tie'));
        else say(byUnit(b, r.winners[0], 'winner', 'winnerTeam'));
      }, 1200);
      break;
    }
  }
}

function step(a, b) {
  // Party Tour: each piece's move.
  if (b.phase === 'tmove' && b.tour && a.tour && b.tour.moveIdx !== a.tour.moveIdx) tourMove(b);
  // Fake Out reveal: each lie that fooled someone, then the truth.
  if (b.phase === 'freveal' && b.fake && a.fake && b.fake.step > a.fake.step && b.fake.step < b.fake.order.length) {
    const opt = b.fake.options.find((o) => o.id === b.fake.order[b.fake.step]);
    say(line(opt?.kind === 'truth' ? 'truth' : 'fooled'), { interrupt: true });
  }
  // Doodle Dash: first correct guess.
  if (b.phase === 'ddraw' && b.doodle && a.doodle && count(b.doodle.guessed) === 1 && count(a.doodle.guessed) === 0) {
    say(line('doodleGot'), { maxWait: 1500 });
  }
}

function tourMove(b) {
  const t = b.tour;
  const ev = t?.events?.[t.moveOrder?.[t.moveIdx]];
  if (!ev) return;
  if (ev.kind === 'trap') say(line('tourTrap'), { interrupt: true, maxWait: 1200 });
  else if (ev.kind === 'bonus' && chance(0.7)) say(line('tourBonus'), { interrupt: true, maxWait: 1200 });
  else if (ev.lap && chance(0.6)) say(line('tourLap'), { interrupt: true, maxWait: 1200 });
}

// Long timed phases where a "hurry up" fits at 5 seconds left.
const HURRY = new Set(['lie', 'pick', 'ddraw', 'pguess', 'finalBet', 'finalQ', 'wq', 'cguess', 'tguess', 'wwrite', 'oclue', 'ovote', 'scdraw', 'mdraw', 'troll']);

/** Call once when a countdown reaches 5 seconds. */
export function lewisHurry(s) {
  if (!s || !HURRY.has(s.phase) || lewis.speaking || !chance(0.5)) return;
  say(line('hurry'), { maxWait: 800 });
}
