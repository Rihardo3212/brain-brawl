<script>
  // The big screen: runs the game engine and shows the room.
  import { onMount, onDestroy } from 'svelte';
  import QRCode from 'qrcode';
  import Logo from '../components/Logo.svelte';
  import FxLayer from '../components/FxLayer.svelte';
  import LobbyView from '../views/host/LobbyView.svelte';
  import TeamDrawView from '../views/host/TeamDrawView.svelte';
  import IntroView from '../views/host/IntroView.svelte';
  import BoardStage from '../views/host/BoardStage.svelte';
  import WedgeStage from '../views/host/WedgeStage.svelte';
  import FakeStage from '../views/host/FakeStage.svelte';
  import DoodleStage from '../views/host/DoodleStage.svelte';
  import EndView from '../views/host/EndView.svelte';
  import ScoreBar from '../views/host/ScoreBar.svelte';
  import { getDb, isLocal } from '../lib/db.js';
  import { newRoomCode, joinUrl } from '../lib/room.js';
  import { GameHost } from '../engine/core.js';
  import { MODES } from '../lib/modes.js';
  import { WEDGES } from '../content/wedges.js';
  import { topWins } from '../lib/wins.js';
  import { sfx, isMuted, setMuted, unlockAudio, audioReady } from '../lib/sound.js';
  import { play as playMusic, stopMusic, musicEnabled, setMusicEnabled } from '../lib/music.js';
  import { fx } from '../lib/fx.js';
  import { getTheme, toggleTheme } from '../lib/theme.js';
  import { DEVELOPER } from '../lib/brand.js';

  let { arg = '' } = $props();

  let s = $state(null);
  let presence = $state({});
  let avatars = $state({});
  let qr = $state('');
  let url = $state('');
  let now = $state(Date.now());
  let muted = $state(isMuted());
  let music = $state(musicEnabled());
  let theme = $state(getTheme());
  let wins = $state(topWins());
  let soundOn = $state(audioReady());
  let db = $state(null);

  let host;
  let clock;
  let unsubAvatars;
  let prev = null;
  let lastTick = null;

  async function openRoom(resume) {
    host?.stop();
    unsubAvatars?.();
    prev = null;
    let code = resume ? sessionStorage.getItem('bb-host-code') : null;
    if (!code) {
      code = newRoomCode();
      sessionStorage.setItem('bb-host-code', code);
    }
    url = joinUrl(code);
    qr = await QRCode.toDataURL(url, { margin: 1, width: 420, color: { dark: '#1b1530', light: '#ffffff' } });
    const allowTiny = arg === 'tiny';
    host = new GameHost(db, code, {
      allowTiny,
      onChange: (st, pr) => {
        const next = JSON.parse(JSON.stringify(st));
        react(prev, next);
        prev = next;
        s = next;
        presence = { ...(pr || {}) };
      },
      onReact: (r) => { fx.react(r.e, r.color); sfx.react(); }
    });
    unsubAvatars = db.onValue(`rooms/${code}/avatars`, (a) => (avatars = a || {}));
    await host.start(!!resume);
    if (allowTiny && host.state.phase === 'lobby') { host.state.settings.length = 'tiny'; host.save(); }
  }

  onMount(async () => {
    db = await getDb();
    await openRoom(true);
    clock = setInterval(() => {
      now = db.now();
      countdownTicks();
      soundOn = audioReady();
    }, 100);
  });

  onDestroy(() => {
    host?.stop();
    unsubAvatars?.();
    clearInterval(clock);
    stopMusic();
  });

  /* ---------- music, sounds and effects when the game changes ---------- */

  const MUSIC_FOR = {
    lobby: 'lobby', teamdraw: 'lobby', intro: 'lobby',
    board: 'board', question: 'think', answer: 'think', reveal: 'think',
    finalBet: 'final', finalQ: 'final', finalJudge: 'final', finalReveal: 'final',
    spin: 'board', wq: 'think', wreveal: 'think',
    lie: 'sneaky', pick: 'sneaky', freveal: 'sneaky',
    dchoose: 'chill', ddraw: 'chill', dreveal: 'chill'
  };
  const STAGE = new Set(['question', 'answer', 'reveal', 'finalBet', 'finalQ', 'finalJudge', 'finalReveal', 'spin', 'wq', 'wreveal', 'lie', 'pick', 'freveal', 'dchoose', 'ddraw', 'dreveal']);
  const count = (o) => Object.keys(o || {}).length;

  function react(a, b) {
    if (!b) return;
    if (!a) { playMusic(MUSIC_FOR[b.phase] ?? 'lobby'); return; }

    if (b.order.length > a.order.length) sfx.join();
    if (b.mode !== a.mode && b.phase === 'lobby') sfx.ding();
    if (b.settings.game !== a.settings.game && b.phase === 'lobby') sfx.pop();

    if (a.phase !== b.phase) {
      if (b.phase !== 'end' && MUSIC_FOR[b.phase]) playMusic(MUSIC_FOR[b.phase]);
      if (a.phase === 'intro') { sfx.fanfare(); fx.stamp("LET'S BRAWL!", MODES[b.settings.game].color, MODES[b.settings.game].name); }
      phaseEffects(a, b);
    }
    stepEffects(a, b);
  }

  function phaseEffects(a, b) {
    const cb = b.current;
    switch (b.phase) {
      case 'teamdraw': sfx.whoosh(); fx.stamp('TEAM TIME!', '#2f8cff'); break;
      case 'intro': sfx.whoosh(); setTimeout(() => sfx.reveal(), 400); break;
      case 'question': if (a.phase === 'board') sfx.whoosh(); break;
      case 'answer': {
        const u = b.units[cb.buzzUnit];
        sfx.buzz(Math.max(0, b.unitOrder.indexOf(cb.buzzUnit)));
        fx.stamp('BUZZ!', u?.color || '#ff3b4f', b.players[cb.buzzer]?.name || '');
        break;
      }
      case 'reveal':
        if (cb.result === 'correct') {
          const u = b.units[cb.winner];
          sfx.correct();
          setTimeout(() => sfx.applause(1.4), 250);
          fx.stamp('CORRECT!', '#22c55e', `+${cb.value} ${u?.name || ''}`);
          fx.confetti(110, [u?.color || '#ffc400', '#ffc400', '#ffffff']);
        } else {
          sfx.sadTrombone();
          fx.stamp(cb.wrongs.length ? 'NOBODY!' : "TIME'S UP!", '#4b3f72', `It was: ${cb.answer}`);
        }
        break;
      case 'finalBet':
        sfx.rise();
        setTimeout(() => sfx.fanfare(), 600);
        fx.stamp('FINAL ROUND!', '#ff3b4f', 'Place your bets!');
        break;
      case 'finalQ': case 'wq': case 'pick': case 'ddraw': sfx.ding(); break;
      case 'finalReveal': sfx.drumroll(2); break;
      case 'spin': case 'lie': case 'dchoose': sfx.whoosh(); break;
      case 'wreveal': {
        const w = b.wedge;
        const cat = WEDGES[w.spin.to];
        if (w.winner) {
          sfx.correct();
          setTimeout(() => sfx.applause(1.2), 250);
          fx.confetti(100, [cat.color, '#ffffff', '#ffc400']);
          fx.stamp('WEDGE!', cat.color, b.units[w.winner]?.name || '');
        } else {
          sfx.wrong();
        }
        break;
      }
      case 'freveal': sfx.drumroll(1.2); break;
      case 'dreveal': {
        const d = b.doodle;
        if (count(d.guessed)) { sfx.reveal(); fx.confetti(70, [b.players[d.drawer]?.color || '#22c55e', '#ffffff']); }
        else sfx.sadTrombone();
        fx.stamp(String(d.reveal || '').toUpperCase(), '#22c55e', count(d.guessed) ? `${count(d.guessed)} got it!` : 'Nobody got it!');
        break;
      }
      case 'end':
        stopMusic();
        sfx.fanfare();
        setTimeout(() => sfx.applause(2.4), 400);
        fx.confetti(260);
        setTimeout(() => fx.confetti(200), 900);
        setTimeout(() => playMusic('lobby'), 4500);
        wins = topWins();
        break;
    }
  }

  function stepEffects(a, b) {
    const ca = a.current, cb = b.current;
    // Brain Board
    if (b.phase === 'question' && cb?.open && !(ca?.open && a.phase === 'question')) sfx.open();
    if (cb && ca && cb.wrongs.length > ca.wrongs.length && b.phase === 'question') {
      sfx.wrong();
      const w = cb.wrongs[cb.wrongs.length - 1];
      fx.stamp('NOPE!', '#ff3b4f', `-${cb.value} ${b.units[w.uid]?.name || ''}`);
    }
    if (b.final && a.final) {
      if (count(b.final.bets) > count(a.final.bets) && b.phase === 'finalBet') sfx.bloop();
      if (count(b.final.answers) > count(a.final.answers)) sfx.bloop();
      if (b.phase === 'finalReveal' && b.final.revealIdx > a.final.revealIdx && b.final.revealIdx < b.final.order.length) {
        const uid = b.final.order[b.final.revealIdx];
        if (b.final.judged[uid]) { sfx.correct(); fx.confetti(70, [b.units[uid].color, '#ffc400']); }
        else sfx.wrong();
        if (b.final.revealIdx + 1 < b.final.order.length) setTimeout(() => sfx.drumroll(1.6), 1700);
      }
    }
    // Wedge Rush
    if (b.wedge && a.wedge && b.phase === 'wq' && count(b.wedge.answers) > count(a.wedge.answers)) sfx.bloop();
    // Fake Out
    if (b.fake && a.fake) {
      if (b.phase === 'lie' && count(b.fake.lies) > count(a.fake.lies)) sfx.bloop();
      if (b.phase === 'pick' && count(b.fake.picks) > count(a.fake.picks)) sfx.bloop();
      if (b.phase === 'freveal' && b.fake.step > a.fake.step && b.fake.step < b.fake.order.length) {
        const opt = b.fake.options.find((o) => o.id === b.fake.order[b.fake.step]);
        if (opt?.kind === 'truth') { sfx.correct(); setTimeout(() => sfx.applause(1), 200); fx.confetti(80, ['#22c55e', '#ffffff', '#ffc400']); }
        else { sfx.stamp(); setTimeout(() => sfx.wrong(), 150); }
      }
    }
    // Doodle Dash
    if (b.doodle && a.doodle && b.phase === 'ddraw' && a.phase === 'ddraw') {
      if (count(b.doodle.guessed) > count(a.doodle.guessed)) sfx.correct();
      else if (b.doodle.feed.length && b.doodle.feed.at(-1)?.kind === 'close' && JSON.stringify(b.doodle.feed) !== JSON.stringify(a.doodle.feed)) sfx.bloop();
      if (b.doodle.hint !== a.doodle.hint) sfx.reveal();
    }
  }

  function deadline() {
    if (!s) return null;
    switch (s.phase) {
      case 'question': return s.current?.open ? s.current.closeAt : null;
      case 'answer': return s.mode === 'party' ? s.current?.answerUntil : null;
      case 'finalBet': return s.final?.betUntil;
      case 'finalQ': return s.final?.until;
      case 'teamdraw': return s.drawUntil;
      case 'wq': return s.wedge?.until;
      case 'lie': case 'pick': return s.fake?.until;
      case 'ddraw': return s.doodle?.until;
      default: return null;
    }
  }
  function countdownTicks() {
    const d = deadline();
    if (!d) { lastTick = null; return; }
    const left = Math.ceil((d - now) / 1000);
    if (left !== lastTick && left > 0 && left <= 5) left % 2 ? sfx.tick() : sfx.tock();
    lastTick = left;
  }

  /* ---------- header buttons ---------- */

  function newRoom() {
    if (!s || s.phase === 'lobby' || s.phase === 'end' || window.confirm('Start a new room? The current game ends.')) openRoom(false);
  }
  function enableSound() {
    unlockAudio();
    soundOn = true;
    if (s) playMusic(MUSIC_FOR[s.phase] ?? 'lobby', true);
  }
  function toggleMusic() {
    music = !music;
    unlockAudio();
    setMusicEnabled(music);
    if (music && s) playMusic(MUSIC_FOR[s.phase] ?? 'lobby', true);
  }
  function toggleSfx() {
    muted = !muted;
    setMuted(muted);
    unlockAudio();
  }

  const here = (pid) => isLocal || !!presence[pid];
  const stage = $derived(!!s && STAGE.has(s.phase));
  const game = $derived(s?.settings.game);
</script>

<div class="screen" class:stage>
  {#if stage}
    <div class="beams" aria-hidden="true"><span></span><span></span><span></span></div>
  {/if}
  <FxLayer />

  <header>
    <a href="#/" class="home" aria-label="Home"><Logo size={0.5} /></a>
    {#if s}
      <span class="sticker code">Room <b>{s.code}</b></span>
      <span class="pill mode">{s.mode === 'host' ? `🎤 Host: ${s.hostName}` : '🎉 Party mode'}</span>
    {/if}
    <div class="right">
      {#if !soundOn}
        <button class="btn sun small" onclick={enableSound}>🔊 Turn on sound</button>
      {/if}
      <button class="icon-btn" onclick={() => (theme = toggleTheme())} aria-label="Theme" title="Light / dark">{theme === 'dark' ? '☀️' : '🌙'}</button>
      <button class="icon-btn" class:off={!music} onclick={toggleMusic} aria-label="Music" title="Music">🎵</button>
      <button class="icon-btn" onclick={toggleSfx} aria-label="Sound effects" title="Sound effects">{muted ? '🔇' : '🔊'}</button>
      <button class="icon-btn" onclick={newRoom} aria-label="New room" title="New room">↻</button>
    </div>
  </header>

  {#if !s}
    <div class="center"><h2>Opening room…</h2></div>
  {:else if s.phase === 'lobby'}
    <LobbyView {s} {avatars} {qr} {url} {wins} {here} />
  {:else if s.phase === 'teamdraw'}
    <TeamDrawView {s} {avatars} {db} {now} />
  {:else if s.phase === 'intro'}
    <IntroView {s} {now} />
  {:else if s.phase === 'end' && s.results}
    <EndView {s} {avatars} />
  {:else if game === 'board'}
    <BoardStage {s} {avatars} {now} />
  {:else if game === 'wedge'}
    <WedgeStage {s} {avatars} {now} />
  {:else if game === 'fakeout'}
    <FakeStage {s} {avatars} {now} />
  {:else if game === 'doodle'}
    <DoodleStage {s} {avatars} {now} {db} />
  {/if}

  {#if s && !['lobby', 'end', 'teamdraw', 'intro'].includes(s.phase)}
    <ScoreBar {s} {avatars} {here} />
  {:else}
    <footer class="footer">a {DEVELOPER} game</footer>
  {/if}
</div>

<style>
  .screen { min-height: 100vh; display: flex; flex-direction: column; position: relative; overflow: hidden; }

  /* Game-show stage for questions and rounds */
  .screen.stage {
    background:
      radial-gradient(ellipse at 50% 120%, rgba(255, 59, 79, 0.35) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 110%, #5b2bd6 0%, #2a1468 38%, #120a33 72%, #08051a 100%);
    color: #fff;
  }
  .beams { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .beams span {
    position: absolute; top: -20%; width: 34vw; height: 140%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 75%);
    clip-path: polygon(45% 0, 55% 0, 100% 100%, 0 100%);
    transform-origin: 50% 0; filter: blur(6px);
  }
  .beams span:nth-child(1) { left: 2%; animation: sweep 7s ease-in-out infinite alternate; }
  .beams span:nth-child(2) { left: 33%; animation: sweep 9s ease-in-out infinite alternate-reverse; opacity: 0.7; }
  .beams span:nth-child(3) { right: 2%; animation: sweep 6s ease-in-out infinite alternate; animation-delay: -2s; }
  @keyframes sweep { from { transform: rotate(-22deg); } to { transform: rotate(22deg); } }

  header { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.5rem 0.6rem; position: relative; z-index: 2; flex-wrap: wrap; }
  .home { text-decoration: none; margin-right: 0.4rem; }
  .code { font-size: 1.2rem; }
  .code b { color: var(--red); letter-spacing: 0.14em; }
  .right { margin-left: auto; display: flex; gap: 0.55rem; align-items: center; }
  .center { flex: 1; display: grid; place-items: center; }
  .stage .pill { background: rgba(255, 255, 255, 0.12); color: #fff; box-shadow: none; }
  .stage .footer { color: rgba(255, 255, 255, 0.6); }
</style>
