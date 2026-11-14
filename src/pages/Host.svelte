<script>
  import { onMount, onDestroy } from 'svelte';
  import QRCode from 'qrcode';
  import Logo from '../components/Logo.svelte';
  import Avatar from '../components/Avatar.svelte';
  import Board from '../components/Board.svelte';
  import { getDb, isLocal } from '../lib/db.js';
  import { newRoomCode, joinUrl, MAX_PLAYERS } from '../lib/room.js';
  import { PartyHost } from '../lib/party.js';
  import { LENGTHS } from '../lib/questions.js';
  import { topWins } from '../lib/wins.js';
  import { sfx, isMuted, setMuted, unlockAudio } from '../lib/sound.js';
  import { DEVELOPER } from '../lib/brand.js';

  let s = $state(null);
  let presence = $state({});
  let avatars = $state({});
  let qr = $state('');
  let url = $state('');
  let now = $state(Date.now());
  let muted = $state(isMuted());
  let wins = $state(topWins());

  let host;
  let db;
  let clock;
  let unsubAvatars;

  async function openRoom(resume) {
    host?.stop();
    unsubAvatars?.();
    let code = resume ? sessionStorage.getItem('bb-host-code') : null;
    if (!code) {
      code = newRoomCode();
      sessionStorage.setItem('bb-host-code', code);
    }
    url = joinUrl(code);
    qr = await QRCode.toDataURL(url, { margin: 1, width: 420, color: { dark: '#2a1160', light: '#ffffff' } });
    host = new PartyHost(db, code, (st, pr) => {
      s = JSON.parse(JSON.stringify(st));
      presence = { ...(pr || {}) };
    });
    unsubAvatars = db.onValue(`rooms/${code}/avatars`, (a) => (avatars = a || {}));
    await host.start(!!resume);
  }

  onMount(async () => {
    db = await getDb();
    await openRoom(true);
    clock = setInterval(() => (now = db.now()), 100);
  });

  onDestroy(() => {
    host?.stop();
    unsubAvatars?.();
    clearInterval(clock);
  });

  function newRoom() {
    if (confirmNew()) openRoom(false);
  }
  function confirmNew() {
    return !s || s.phase === 'lobby' || s.phase === 'end' || window.confirm('Start a new room? The current game ends.');
  }

  function toggleMute() {
    muted = !muted;
    setMuted(muted);
    unlockAudio();
  }

  // Sound effects on changes
  let prevPhase = null;
  let prevCount = 0;
  let prevWrongs = 0;
  $effect(() => {
    if (!s) return;
    const count = s.order.length;
    if (count > prevCount && prevCount !== 0) sfx.join();
    if (count > prevCount && prevCount === 0 && count > 0) sfx.join();
    prevCount = count;

    const wrongs = s.current?.wrongs?.length || 0;
    if (s.phase !== prevPhase) {
      if (s.phase === 'question' && prevPhase === 'board') sfx.pick();
      if (s.phase === 'answer') sfx.buzz();
      if (s.phase === 'reveal') s.current.result === 'correct' ? sfx.correct() : sfx.wrong();
      if (s.phase === 'end') { sfx.win(); wins = topWins(); }
    }
    if (wrongs > prevWrongs && s.phase === 'question') sfx.wrong();
    prevWrongs = wrongs;
    prevPhase = s.phase;
  });

  let lastOpen = false;
  $effect(() => {
    const open = s?.phase === 'question' && s.current?.open;
    if (open && !lastOpen) sfx.open();
    lastOpen = !!open;
  });

  const players = $derived(s ? s.order.map((id) => ({ id, ...s.players[id] })) : []);
  const cur = $derived(s?.current);
  const P = (id) => (s && id ? { id, ...s.players[id] } : null);

  function secsLeft(until) {
    return Math.max(0, Math.ceil((until - now) / 1000));
  }
  function frac(from, until) {
    return Math.max(0, Math.min(1, (until - now) / (until - from)));
  }
</script>

<div class="screen">
  <header>
    <a href="#/" class="home" aria-label="Home"><Logo size={0.45} /></a>
    {#if s}
      <div class="chip">Room <b>{s.code}</b></div>
    {/if}
    <div class="right">
      <button class="icon-btn" onclick={toggleMute} aria-label="Sound">{muted ? '🔇' : '🔊'}</button>
      <button class="icon-btn" onclick={newRoom} aria-label="New room" title="New room">↻</button>
    </div>
  </header>

  {#if !s}
    <div class="center on-bg"><h2>Opening room…</h2></div>

  {:else if s.phase === 'lobby'}
    <section class="lobby">
      <div class="join card pop-in">
        <h2>Join on your phone</h2>
        {#if qr}<img class="qr" src={qr} alt="QR code to join" />{/if}
        <p class="muted small">or go to <b>{url.split('#')[0]}</b> and enter</p>
        <div class="bigcode">{s.code}</div>
        {#if isLocal}
          <p class="notice dark">Local test mode: open the join link in another tab of this browser.</p>
        {/if}
      </div>

      <div class="side">
        <div class="slots">
          {#each Array(MAX_PLAYERS) as _, i}
            {@const p = players[i]}
            <div class="slot" class:filled={p}>
              {#if p}
                <div class="pop-in">
                  <Avatar src={avatars[p.id]} color={p.color} name={p.name} size={110} crown={s.vip === p.id} dim={!presence[p.id] && !isLocal} />
                </div>
                <div class="pname">{p.name}</div>
                <div class="pstate">{p.ready ? 'Ready!' : 'drawing…'}</div>
              {:else}
                <div class="empty wobble">?</div>
                <div class="pstate">waiting</div>
              {/if}
            </div>
          {/each}
        </div>

        <div class="card info">
          {#if players.length === 0}
            <h3>Waiting for players…</h3>
            <p class="muted">The first one to join becomes the VIP 👑 and starts the game.</p>
          {:else}
            <h3>{P(s.vip)?.name} is the VIP 👑</h3>
            <p class="muted">
              {LENGTHS[s.settings.length].label} game · {LENGTHS[s.settings.length].detail}<br />
              The VIP presses Start on their phone when everyone is in.
            </p>
          {/if}
        </div>

        {#if wins.length}
          <div class="wins">
            <span>🏆 Wins:</span>
            {#each wins as [name, n]}<span class="win">{name} <b>{n}</b></span>{/each}
          </div>
        {/if}
      </div>
    </section>

  {:else if s.phase === 'board'}
    <section class="stage">
      <div class="turn on-bg">
        <Avatar src={avatars[s.turn]} color={P(s.turn)?.color} name={P(s.turn)?.name} size={56} />
        <h2><span style="color:{P(s.turn)?.color}" class="hl">{P(s.turn)?.name}</span> picks the next question</h2>
      </div>
      <Board board={s.board} />
    </section>

  {:else if (s.phase === 'question' || s.phase === 'answer' || s.phase === 'reveal') && cur}
    <section class="stage question">
      <div class="qhead on-bg">
        <span class="qcat">{cur.icon} {cur.cat}</span>
        <span class="qval">{cur.value}</span>
      </div>

      <div class="qcard card pop-in">
        <h1 class="qtext">{cur.q}</h1>
      </div>

      <div class="options">
        {#each cur.options as o, i}
          {@const wrongBy = cur.wrongs.find((w) => w.i === i)}
          <div
            class="opt"
            class:correct={s.phase === 'reveal' && i === cur.correctIndex}
            class:wrong={wrongBy || (s.phase === 'reveal' && cur.chosen === i && i !== cur.correctIndex)}
            class:faded={s.phase === 'reveal' && i !== cur.correctIndex}
          >
            <span class="letter">{'ABCD'[i]}</span> {o}
            {#if wrongBy}<span class="by"><Avatar src={avatars[wrongBy.id]} color={P(wrongBy.id)?.color} name={P(wrongBy.id)?.name} size={34} /></span>{/if}
          </div>
        {/each}
      </div>

      <div class="status">
        {#if s.phase === 'question' && !cur.open}
          <div class="pill wait">Read it… buzzers open soon</div>
        {:else if s.phase === 'question'}
          <div class="pill go">BUZZ NOW! <span class="secs">{secsLeft(cur.closeAt)}</span></div>
          <div class="bar"><div style="transform:scaleX({frac(cur.closeAt - 10000, cur.closeAt)})"></div></div>
        {:else if s.phase === 'answer'}
          {@const b = P(cur.buzzer)}
          <div class="buzzed pop-in">
            <Avatar src={avatars[b.id]} color={b.color} name={b.name} size={84} />
            <div class="pill" style="background:{b.color}">{b.name} is answering… <span class="secs">{secsLeft(cur.answerUntil)}</span></div>
          </div>
        {:else if s.phase === 'reveal'}
          {#if cur.result === 'correct'}
            {@const w = P(s.turn)}
            <div class="pill good pop-in">{w.name} got it! +{cur.value}</div>
          {:else}
            <div class="pill bad pop-in">Nobody got it!</div>
          {/if}
        {/if}
      </div>
    </section>

  {:else if s.phase === 'end' && s.results}
    <section class="stage end">
      <h1 class="on-bg title pop-in">
        {#if s.results.winners.length > 1}It's a tie!{:else}{P(s.results.winners[0])?.name} wins!{/if}
      </h1>
      <div class="podium">
        {#each s.results.ranked as id, i}
          {@const p = P(id)}
          <div class="place pop-in" style="animation-delay:{i * 150}ms">
            {#if s.results.winners.includes(id)}<div class="trophy">🏆</div>{/if}
            <Avatar src={avatars[id]} color={p.color} name={p.name} size={s.results.winners.includes(id) ? 150 : 100} />
            <div class="pname on-bg">{p.name}</div>
            <div class="score">{p.score}</div>
          </div>
        {/each}
      </div>
      <p class="on-bg">The VIP can start a new round from their phone.</p>
    </section>
  {/if}

  {#if s && s.phase !== 'lobby' && s.phase !== 'end'}
    <footer class="scores">
      {#each players as p}
        <div class="sc" class:turn={s.turn === p.id && s.phase === 'board'} class:out={cur?.lockedOut?.[p.id]}>
          <Avatar src={avatars[p.id]} color={p.color} name={p.name} size={52} dim={!presence[p.id] && !isLocal} />
          <div>
            <div class="sname">{p.name}</div>
            <div class="spts" class:neg={p.score < 0}>{p.score}</div>
          </div>
        </div>
      {/each}
    </footer>
  {:else}
    <footer class="footer">a {DEVELOPER} game</footer>
  {/if}
</div>

<style>
  .screen { min-height: 100vh; display: flex; flex-direction: column; }
  header { display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.4rem; }
  .home { text-decoration: none; }
  .chip {
    background: #fff; box-shadow: var(--shadow);
    border-radius: 999px; padding: 0.3rem 1.1rem; font-size: 1.2rem; font-weight: 800;
  }
  .chip b { letter-spacing: 0.15em; color: var(--red); }
  .right { margin-left: auto; display: flex; gap: 0.6rem; }
  .icon-btn {
    width: 50px; height: 50px; border-radius: 50%;
    background: #fff; box-shadow: 0 4px 0 #cfcfcf; font-size: 1.35rem;
  }
  .icon-btn:hover { animation: ring 0.9s ease-in-out infinite alternate; }
  .center { flex: 1; display: grid; place-items: center; }

  /* Lobby */
  .lobby {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(300px, 420px) 1fr;
    gap: 2.2rem;
    padding: 1rem 2.5rem;
    align-items: center;
    max-width: 1300px; margin: 0 auto; width: 100%;
  }
  .join { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; border-top: 10px solid var(--red); }
  .qr { width: 100%; max-width: 290px; border-radius: 12px; }
  .small { margin: 0; font-size: 0.95rem; word-break: break-all; }
  .bigcode { font-size: 4.6rem; font-weight: 900; letter-spacing: 0.16em; color: var(--red); line-height: 1; }
  .notice.dark { margin: 0.3rem 0 0; }
  .side { display: flex; flex-direction: column; gap: 1.4rem; }
  .slots { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  .slot {
    display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
    text-align: center; padding: 1.4rem 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.5); border-radius: 24px;
  }
  .slot.filled { background: #fff; box-shadow: var(--shadow); }
  .empty {
    width: 110px; height: 110px; border-radius: 30%;
    border: 5px dashed #c8c8c8;
    display: grid; place-items: center;
    font-size: 3rem; font-weight: 900; color: #c3c3c3;
  }
  .pname { font-weight: 900; font-size: 1.35rem; }
  .pstate { color: var(--muted); font-weight: 700; }
  .info h3 { font-size: 1.5rem; }
  .info p { margin: 0.3rem 0 0; }
  .wins { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; font-weight: 800; }
  .win { background: #fff; box-shadow: var(--shadow); border-radius: 999px; padding: 0.15rem 0.8rem; }

  /* Board + question */
  .stage {
    flex: 1;
    display: flex; flex-direction: column; gap: 1.2rem;
    padding: 0.5rem 2.5rem 1rem;
    max-width: 1400px; width: 100%; margin: 0 auto;
  }
  .turn {
    display: flex; align-items: center; gap: 1rem; justify-content: center;
    background: #fff; box-shadow: var(--shadow); border-radius: 999px;
    padding: 0.5rem 1.8rem 0.5rem 0.6rem; align-self: center;
  }
  .turn h2 { font-size: 1.8rem; }
  .hl { font-weight: 900; }

  .question { align-items: center; justify-content: center; }
  .qhead { display: flex; gap: 0.8rem; align-items: center; font-size: 1.5rem; font-weight: 900; }
  .qcat { background: var(--red); color: #fff; border-radius: 999px; padding: 0.15rem 1.1rem; box-shadow: 0 4px 0 var(--red-dark); }
  .qval { background: var(--sun); color: var(--ink); border-radius: 999px; padding: 0.15rem 1.1rem; box-shadow: 0 4px 0 #c99a00; }
  .qcard { width: 100%; max-width: 1100px; padding: 2.4rem 2rem; text-align: center; }
  .qtext { font-size: clamp(2rem, 3.6vw, 3.4rem); line-height: 1.2; }
  .options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; width: 100%; max-width: 1100px; }
  .opt {
    position: relative;
    background: #fff;
    border-radius: 999px;
    padding: 0.85rem 1.4rem 0.85rem 0.9rem;
    font-size: 1.65rem; font-weight: 800;
    display: flex; align-items: center; gap: 0.8rem;
    box-shadow: 0 5px 0 #cfcfcf;
    transition: all 0.3s;
  }
  .letter {
    background: var(--ink); color: #fff; border-radius: 50%;
    width: 2.4rem; height: 2.4rem; display: grid; place-items: center; font-size: 1.2rem; flex-shrink: 0;
  }
  .opt.correct { background: var(--good); color: #fff; transform: scale(1.04); box-shadow: 0 5px 0 #138a35; }
  .opt.correct .letter { background: #fff; color: var(--good); }
  .opt.wrong { background: var(--bad); color: #fff; box-shadow: 0 5px 0 var(--red-dark); }
  .opt.faded:not(.wrong) { opacity: 0.45; }
  .by { margin-left: auto; }

  .status { min-height: 7rem; display: flex; flex-direction: column; align-items: center; gap: 0.7rem; width: 100%; max-width: 600px; }
  .pill {
    background: #fff; color: var(--ink);
    border-radius: 999px; padding: 0.6rem 1.7rem;
    font-size: 1.8rem; font-weight: 900;
    box-shadow: var(--shadow);
    display: flex; align-items: center; gap: 0.8rem;
  }
  .pill.wait { background: transparent; color: var(--muted); box-shadow: none; }
  .pill.go { background: var(--red); color: #fff; box-shadow: 0 5px 0 var(--red-dark); animation: throb 0.5s ease-in-out infinite alternate; }
  .pill.good { background: var(--good); color: #fff; box-shadow: 0 5px 0 #138a35; }
  .pill.bad { background: var(--ink); color: #fff; box-shadow: 0 5px 0 #000; }
  @keyframes throb { to { transform: scale(1.07) rotate(-1deg); } }
  .secs { background: rgba(0, 0, 0, 0.15); border-radius: 999px; min-width: 2.3rem; text-align: center; padding: 0 0.5rem; }
  .bar { width: 100%; height: 14px; background: #d6d6d6; border-radius: 99px; overflow: hidden; }
  .bar div { height: 100%; background: var(--red); transform-origin: left; transition: transform 0.1s linear; }
  .buzzed { display: flex; align-items: center; gap: 1rem; }

  /* End */
  .end { align-items: center; justify-content: center; text-align: center; }
  .title { font-size: 4.2rem; font-style: italic; color: var(--red); }
  .podium { display: flex; gap: 2rem; align-items: flex-end; justify-content: center; flex-wrap: wrap; }
  .place {
    display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
    background: #fff; border-radius: 28px; padding: 1.2rem 1.6rem; box-shadow: var(--shadow);
  }
  .trophy { font-size: 3rem; animation: hop 0.8s ease-in-out infinite alternate; }
  @keyframes hop { to { transform: translateY(-8px) rotate(8deg); } }
  .score { background: var(--sun); border-radius: 999px; padding: 0.15rem 1.2rem; font-weight: 900; font-size: 1.6rem; box-shadow: 0 4px 0 #c99a00; }

  /* Scoreboard */
  .scores { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; padding: 0.8rem 1rem 1.3rem; }
  .sc {
    display: flex; align-items: center; gap: 0.7rem;
    background: #fff; box-shadow: var(--shadow);
    border-radius: 999px; padding: 0.4rem 1.3rem 0.4rem 0.45rem;
    transition: all 0.2s;
  }
  .sc.turn { transform: translateY(-5px); animation: ring 0.9s ease-in-out infinite alternate; }
  .sc.out { opacity: 0.45; }
  .sname { font-weight: 800; font-size: 1.05rem; color: var(--muted); }
  .spts { font-weight: 900; font-size: 1.5rem; }
  .spts.neg { color: var(--red); }
</style>
