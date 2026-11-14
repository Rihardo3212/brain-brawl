// Party mode game engine. Runs only on the main screen (the "host" device).
// Phones send inputs to rooms/CODE/inputs, the engine updates rooms/CODE/state,
// and every screen draws itself from that state.

import { CATEGORIES, LENGTHS, shuffle, getQuestion } from './questions.js';
import { PLAYER_COLORS, MAX_PLAYERS } from './room.js';
import { addWin } from './wins.js';

const BUZZ_WINDOW = 10000;   // how long buzzers stay open
const ANSWER_TIME = 10000;   // time to pick an option after buzzing
const REVEAL_TIME = 3500;    // how long the answer stays on screen
const BUZZ_SETTLE = 250;     // wait this long after the first buzz to compare server times

// Firebase does not store empty objects/arrays or nulls, so fill them back in
// whenever state is read from the database.
export function normalize(s) {
  if (!s) return s;
  s.players = s.players || {};
  s.order = s.order || [];
  s.settings = s.settings || { length: 'quick' };
  s.vip = s.vip ?? null;
  s.turn = s.turn ?? null;
  s.board = s.board ?? null;
  s.current = s.current ?? null;
  s.results = s.results ?? null;
  if (s.board) s.board.used = s.board.used || {};
  if (s.current) {
    s.current.lockedOut = s.current.lockedOut || {};
    s.current.wrongs = s.current.wrongs || [];
    s.current.buzzer = s.current.buzzer ?? null;
    s.current.chosen = s.current.chosen ?? null;
    s.current.correctIndex = s.current.correctIndex ?? null;
  }
  if (s.results) {
    s.results.ranked = s.results.ranked || [];
    s.results.winners = s.results.winners || [];
  }
  return s;
}

export function newLobbyState(code) {
  return {
    code,
    phase: 'lobby',
    mode: 'party',
    vip: null,
    settings: { length: 'quick' },
    players: {},
    order: [],
    board: null,
    turn: null,
    current: null,
    results: null,
    game: 0
  };
}

export class PartyHost {
  constructor(db, code, onChange) {
    this.db = db;
    this.code = code;
    this.onChange = onChange;
    this.state = null;
    this.presence = {};
    this.pendingBuzzes = [];
    this.buzzTimer = null;
    this.unsubs = [];
  }

  path(p) { return `rooms/${this.code}/${p}`; }

  async start(resume) {
    const saved = resume ? await this.db.get(this.path('state')) : null;
    this.state = normalize(saved) || newLobbyState(this.code);
    if (!saved) {
      await this.db.remove(this.path('inputs'));
      await this.db.remove(this.path('avatars'));
    }
    await this.save();

    this.unsubs.push(this.db.onValue(this.path('presence'), (p) => {
      this.presence = p || {};
      this.onChange(this.state, this.presence);
    }));
    this.unsubs.push(this.db.onChildAdded(this.path('inputs'), (key, input) => {
      this.db.remove(this.path(`inputs/${key}`));
      if (input) this.handle(input);
    }));
    this.ticker = setInterval(() => this.tick(), 200);
  }

  stop() {
    clearInterval(this.ticker);
    clearTimeout(this.buzzTimer);
    this.unsubs.forEach((u) => u && u());
  }

  async save() {
    this.onChange(this.state, this.presence);
    await this.db.set(this.path('state'), this.state);
  }

  now() { return this.db.now(); }

  isHere(id) { return !!this.presence[id]; }

  handle(input) {
    const s = this.state;
    const from = input.from;
    const p = s.players[from];

    switch (input.type) {
      case 'join': {
        const name = String(input.name || '').trim().slice(0, 14);
        if (!name) return;
        if (p) { p.name = name; break; }
        if (s.phase !== 'lobby' || s.order.length >= MAX_PLAYERS) return;
        const used = s.order.map((id) => s.players[id].color);
        s.players[from] = {
          name,
          color: PLAYER_COLORS.find((c) => !used.includes(c)) || PLAYER_COLORS[0],
          score: 0,
          ready: false
        };
        s.order.push(from);
        if (!s.vip) s.vip = from;
        break;
      }
      case 'avatarDone':
        if (!p) return;
        p.ready = true;
        break;
      case 'leave':
        if (!p || s.phase !== 'lobby') return;
        delete s.players[from];
        s.order = s.order.filter((id) => id !== from);
        if (s.vip === from) s.vip = s.order[0] || null;
        break;
      case 'settings':
        if (from !== s.vip || s.phase !== 'lobby') return;
        if (LENGTHS[input.length]) s.settings.length = input.length;
        break;
      case 'start':
        if (from !== s.vip || s.phase !== 'lobby' || s.order.length < 1) return;
        this.newGame();
        break;
      case 'pick':
        this.pick(from, input.c, input.r);
        return;
      case 'buzz':
        this.buzz(from, input.ts);
        return;
      case 'answer':
        this.answer(from, input.i);
        return;
      case 'again':
        if (from !== s.vip || s.phase !== 'end') return;
        s.phase = 'lobby';
        s.board = null;
        s.current = null;
        s.results = null;
        s.turn = null;
        break;
      default:
        return;
    }
    this.save();
  }

  newGame() {
    const s = this.state;
    const len = LENGTHS[s.settings.length];
    const cats = shuffle(CATEGORIES).slice(0, len.cats);
    s.board = {
      cats: cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
      rows: len.rows,
      used: {}
    };
    s.order.forEach((id) => (s.players[id].score = 0));
    s.turn = s.order[Math.floor(Math.random() * s.order.length)];
    s.current = null;
    s.results = null;
    s.game += 1;
    s.phase = 'board';
  }

  pick(from, c, r) {
    const s = this.state;
    if (s.phase !== 'board' || !s.players[from]) return;
    // The player whose turn it is picks. If they dropped out, anyone can.
    if (from !== s.turn && this.isHere(s.turn)) return;
    if (!s.board.cats[c] || r < 0 || r >= s.board.rows || s.board.used[`${c}-${r}`]) return;

    const cat = s.board.cats[c];
    const q = getQuestion(cat.id, r);
    const readMs = Math.min(5500, 1800 + q.q.length * 35);
    s.current = {
      c, r,
      cat: cat.name,
      icon: cat.icon,
      value: (r + 1) * 100,
      q: q.q,
      options: shuffle([q.a, ...q.w]),
      openAt: this.now() + readMs,
      open: false,
      closeAt: null,
      lockedOut: {},
      buzzer: null,
      answerUntil: null,
      wrongs: [],
      correctIndex: null,
      result: null,
      revealUntil: null
    };
    s.phase = 'question';
    this.pendingBuzzes = [];
    this.save();
  }

  buzz(from, ts) {
    const s = this.state;
    const cur = s.current;
    if (s.phase !== 'question' || !cur || !cur.open || !s.players[from]) return;
    if (cur.lockedOut[from]) return;
    if (this.pendingBuzzes.some((b) => b.id === from)) return;
    this.pendingBuzzes.push({ id: from, ts: typeof ts === 'number' ? ts : this.now() });
    if (!this.buzzTimer) {
      this.buzzTimer = setTimeout(() => this.settleBuzz(), BUZZ_SETTLE);
    }
  }

  settleBuzz() {
    this.buzzTimer = null;
    const s = this.state;
    if (s.phase !== 'question' || !this.pendingBuzzes.length) { this.pendingBuzzes = []; return; }
    const first = this.pendingBuzzes.sort((a, b) => a.ts - b.ts)[0];
    this.pendingBuzzes = [];
    s.current.buzzer = first.id;
    s.current.answerUntil = this.now() + ANSWER_TIME;
    s.phase = 'answer';
    this.save();
  }

  answer(from, i) {
    const s = this.state;
    const cur = s.current;
    if (s.phase !== 'answer' || cur.buzzer !== from) return;
    this.resolveAnswer(from, Number.isInteger(i) ? i : null);
  }

  resolveAnswer(id, i) {
    const s = this.state;
    const cur = s.current;
    const q = getQuestion(s.board.cats[cur.c].id, cur.r);
    const right = i !== null && cur.options[i] === q.a;
    const player = s.players[id];

    if (right) {
      player.score += cur.value;
      s.turn = id;
      this.reveal('correct', i);
      return;
    }

    player.score -= cur.value;
    cur.lockedOut[id] = true;
    cur.wrongs.push({ id, i });
    cur.buzzer = null;
    cur.answerUntil = null;

    const left = s.order.filter((pid) => !cur.lockedOut[pid] && this.isHere(pid));
    if (left.length === 0) {
      this.reveal('nobody');
    } else {
      // Others get another chance to buzz.
      s.phase = 'question';
      cur.open = true;
      cur.closeAt = this.now() + BUZZ_WINDOW;
      this.save();
    }
  }

  reveal(result, chosen = null) {
    const s = this.state;
    const cur = s.current;
    const q = getQuestion(s.board.cats[cur.c].id, cur.r);
    cur.correctIndex = cur.options.indexOf(q.a);
    cur.result = result;
    cur.chosen = chosen;
    cur.revealUntil = this.now() + REVEAL_TIME;
    s.phase = 'reveal';
    this.save();
  }

  finish() {
    const s = this.state;
    const ranked = [...s.order].sort((a, b) => s.players[b].score - s.players[a].score);
    const top = s.players[ranked[0]]?.score ?? 0;
    const winners = ranked.filter((id) => s.players[id].score === top);
    s.results = { ranked, winners };
    winners.forEach((id) => addWin(s.players[id].name));
    s.phase = 'end';
    s.current = null;
    this.save();
  }

  tick() {
    const s = this.state;
    if (!s) return;
    const cur = s.current;
    const now = this.now();

    if (s.phase === 'question' && cur) {
      if (!cur.open && now >= cur.openAt) {
        cur.open = true;
        cur.closeAt = now + BUZZ_WINDOW;
        this.save();
      } else if (cur.open && cur.closeAt && now >= cur.closeAt && !this.buzzTimer) {
        this.reveal('nobody');
      }
    } else if (s.phase === 'answer' && cur && now >= cur.answerUntil) {
      this.resolveAnswer(cur.buzzer, null);
    } else if (s.phase === 'reveal' && cur && now >= cur.revealUntil) {
      s.board.used[`${cur.c}-${cur.r}`] = true;
      s.current = null;
      const total = s.board.cats.length * s.board.rows;
      if (Object.keys(s.board.used).length >= total) this.finish();
      else { s.phase = 'board'; this.save(); }
    }
  }
}
