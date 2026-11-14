<script>
  import { onMount, onDestroy } from 'svelte';
  import Logo from '../components/Logo.svelte';
  import Avatar from '../components/Avatar.svelte';
  import Board from '../components/Board.svelte';
  import DrawPad from '../components/DrawPad.svelte';
  import { getDb } from '../lib/db.js';
  import { myId, cleanCode, MAX_PLAYERS } from '../lib/room.js';
  import { LENGTHS } from '../lib/questions.js';
  import { normalize } from '../lib/party.js';
  import { sfx, unlockAudio } from '../lib/sound.js';

  let { code: rawCode = '' } = $props();
  // svelte-ignore state_referenced_locally
  const code = cleanCode(rawCode);

  const id = myId();
  let db;
  let s = $state(undefined); // undefined = loading, null = no room
  let avatars = $state({});
  let name = $state(localStorage.getItem('bb-name') || '');
  let joining = $state(false);
  let redraw = $state(false);
  let tooEarly = $state(false);
  let buzzedLocal = $state(false);
  let codeInput = $state('');
  const unsubs = [];

  onMount(async () => {
    if (!code) { s = null; return; }
    db = await getDb();
    unsubs.push(db.onValue(`rooms/${code}/state`, (v) => (s = normalize(v))));
    unsubs.push(db.onValue(`rooms/${code}/avatars`, (a) => (avatars = a || {})));
    // Presence: lets the big screen see if this phone is still connected.
    unsubs.push(db.onConnection((ok) => {
      if (!ok) return;
      db.set(`rooms/${code}/presence/${id}`, true);
      db.removeOnDisconnect(`rooms/${code}/presence/${id}`);
    }));
  });
  onDestroy(() => unsubs.forEach((u) => u && u()));

  function send(type, data = {}) {
    return db.push(`rooms/${code}/inputs`, { type, from: id, ts: db.serverTime(), ...data });
  }

  const me = $derived(s?.players?.[id]);
  const cur = $derived(s?.current);
  const isVip = $derived(s?.vip === id);
  const myAvatar = $derived(avatars[id]);
  const P = (pid) => (s && pid ? { id: pid, ...s.players[pid] } : null);
  const playerCount = $derived(s?.order?.length || 0);

  function join(e) {
    e.preventDefault();
    unlockAudio();
    const n = name.trim();
    if (!n) return;
    localStorage.setItem('bb-name', n);
    joining = true;
    send('join', { name: n });
  }

  async function saveDrawing(dataUrl) {
    await db.set(`rooms/${code}/avatars/${id}`, dataUrl);
    send('avatarDone');
    redraw = false;
    sfx.pop();
  }

  function buzz() {
    unlockAudio();
    if (!cur || cur.lockedOut?.[id] || buzzedLocal) return;
    if (!cur.open) {
      // Too early: short local lockout.
      tooEarly = true;
      navigator.vibrate?.(200);
      setTimeout(() => (tooEarly = false), 700);
      return;
    }
    if (tooEarly) return;
    buzzedLocal = true;
    navigator.vibrate?.(60);
    sfx.buzz();
    send('buzz');
  }

  // Reset the local buzz flag whenever the buzzers reopen or a new question starts.
  $effect(() => {
    const key = `${s?.phase}|${cur?.c}|${cur?.r}|${cur?.wrongs?.length}`;
    key; buzzedLocal = false;
  });

  // Feedback on my phone
  let prevPhase = null;
  $effect(() => {
    if (!s) return;
    if (s.phase !== prevPhase) {
      if (s.phase === 'answer' && cur?.buzzer === id) navigator.vibrate?.([80, 40, 80]);
      if (s.phase === 'reveal' && cur?.result === 'correct' && s.turn === id) sfx.correct();
      if (s.phase === 'board' && s.turn === id) navigator.vibrate?.(100);
    }
    prevPhase = s.phase;
  });

  function goCode(e) {
    e.preventDefault();
    if (cleanCode(codeInput).length === 4) location.hash = `#/join/${cleanCode(codeInput)}`;
  }
</script>

<div class="phone" style="--me:{me?.color || '#ffd23f'}">
  <header>
    <a href="#/" aria-label="Home"><Logo size={0.38} /></a>
    {#if me}
      <div class="me">
        <span class="mname">{me.name}</span>
        <span class="mscore">{me.score}</span>
      </div>
    {/if}
  </header>

  <main>
    {#if s === undefined}
      <p class="on-bg">Connecting…</p>

    {:else if s === null}
      <div class="card stack pop-in">
        <h2>{code ? `Room ${code} not found` : 'Enter room code'}</h2>
        <p class="muted">Check the code on the big screen.</p>
        <form onsubmit={goCode} class="stack">
          <input class="field code" maxlength="4" placeholder="ABCD" bind:value={codeInput} oninput={() => (codeInput = cleanCode(codeInput))} />
          <button class="btn block" disabled={codeInput.length !== 4}>Join</button>
        </form>
      </div>

    {:else if !me}
      {#if s.phase !== 'lobby'}
        <div class="card stack pop-in">
          <h2>Game in progress</h2>
          <p class="muted">Wait for the next round, then you can join.</p>
        </div>
      {:else if playerCount >= MAX_PLAYERS}
        <div class="card stack pop-in">
          <h2>Room is full</h2>
          <p class="muted">This game has {MAX_PLAYERS} players already. Teams are coming soon!</p>
        </div>
      {:else}
        <form class="card stack pop-in" onsubmit={join}>
          <h2>Room {code}</h2>
          <label for="name" class="muted">Your name</label>
          <input id="name" class="field" maxlength="14" autocomplete="off" bind:value={name} placeholder="Name" />
          <button class="btn big block" disabled={!name.trim() || joining}>{joining ? 'Joining…' : "I'm in!"}</button>
        </form>
      {/if}

    {:else if !me.ready || redraw}
      <DrawPad color={me.color} onDone={saveDrawing} />

    {:else if s.phase === 'lobby'}
      <div class="stack center">
        <div class="pop-in"><Avatar src={myAvatar} color={me.color} name={me.name} size={150} crown={isVip} /></div>
        <h2 class="on-bg">You're in, {me.name}!</h2>
        <button class="btn ghost" onclick={() => (redraw = true)}>Redraw</button>
        {#if isVip}
          <div class="card stack">
            <h3>You're the VIP 👑</h3>
            <p class="muted">Pick a game length and start when everyone is ready.</p>
            <div class="lengths">
              {#each Object.entries(LENGTHS) as [key, l]}
                <button class="len" class:on={s.settings.length === key} onclick={() => send('settings', { length: key })}>
                  <b>{l.label}</b><span>{l.detail}</span>
                </button>
              {/each}
            </div>
            <button class="btn big block" onclick={() => send('start')}>
              Start with {playerCount} player{playerCount === 1 ? '' : 's'}
            </button>
          </div>
        {:else}
          <p class="on-bg">Waiting for {P(s.vip)?.name} to start…</p>
        {/if}
      </div>

    {:else if s.phase === 'board'}
      {#if s.turn === id}
        <div class="stack">
          <h2 class="on-bg center-text">Your pick!</h2>
          <Board board={s.board} compact onPick={(c, r) => { sfx.pick(); send('pick', { c, r }); }} />
        </div>
      {:else}
        <div class="stack center">
          <Avatar src={avatars[s.turn]} color={P(s.turn)?.color} name={P(s.turn)?.name} size={110} />
          <h2 class="on-bg">{P(s.turn)?.name} is picking…</h2>
          <p class="on-bg dimmed">Get your finger ready.</p>
        </div>
      {/if}

    {:else if s.phase === 'question' && cur}
      {#if cur.lockedOut?.[id]}
        <div class="stack center">
          <div class="bigemoji">🔒</div>
          <h2 class="on-bg">Locked out</h2>
          <p class="on-bg dimmed">The others can still buzz.</p>
        </div>
      {:else}
        <div class="stack center">
          <p class="on-bg qmini">{cur.icon} {cur.cat} · {cur.value}</p>
          <button
            class="buzzer"
            class:open={cur.open && !tooEarly}
            class:early={tooEarly}
            class:sent={buzzedLocal}
            onpointerdown={buzz}
          >
            {#if tooEarly}Too early!{:else if buzzedLocal}Buzzed!{:else if cur.open}BUZZ!{:else}Wait…{/if}
          </button>
        </div>
      {/if}

    {:else if s.phase === 'answer' && cur}
      {#if cur.buzzer === id}
        <div class="stack">
          <h2 class="on-bg center-text">You buzzed first! Pick:</h2>
          {#each cur.options as o, i}
            {#if !cur.wrongs.some((w) => w.i === i)}
              <button class="answer" onclick={() => { navigator.vibrate?.(30); send('answer', { i }); }}>
                <span class="letter">{'ABCD'[i]}</span>{o}
              </button>
            {/if}
          {/each}
        </div>
      {:else}
        {@const b = P(cur.buzzer)}
        <div class="stack center">
          <Avatar src={avatars[b.id]} color={b.color} name={b.name} size={110} />
          <h2 class="on-bg">{b.name} is answering…</h2>
        </div>
      {/if}

    {:else if s.phase === 'reveal' && cur}
      {@const won = cur.result === 'correct' && s.turn === id}
      {@const lost = cur.wrongs.some((w) => w.id === id)}
      <div class="stack center pop-in">
        <div class="bigemoji">{won ? '🎉' : lost ? '😬' : '👀'}</div>
        {#if won}<h2 class="on-bg">+{cur.value}! Nice!</h2>{:else if lost}<h2 class="on-bg">-{cur.value}</h2>{/if}
        <p class="on-bg dimmed">The answer was</p>
        <p class="on-bg answertext">{cur.options[cur.correctIndex]}</p>
      </div>

    {:else if s.phase === 'end' && s.results}
      {@const place = s.results.ranked.indexOf(id) + 1}
      <div class="stack center pop-in">
        <div class="bigemoji">{s.results.winners.includes(id) ? '🏆' : place === 2 ? '🥈' : place === 3 ? '🥉' : '🙃'}</div>
        <h2 class="on-bg">{s.results.winners.includes(id) ? 'You win!' : `#${place}`}</h2>
        <p class="on-bg">{me.score} points</p>
        {#if isVip}
          <button class="btn big" onclick={() => send('again')}>Play again</button>
        {:else}
          <p class="on-bg dimmed">Waiting for the VIP…</p>
        {/if}
      </div>
    {/if}
  </main>
</div>

<style>
  .phone {
    min-height: 100vh; min-height: 100dvh;
    display: flex; flex-direction: column;
    max-width: 520px; margin: 0 auto;
    user-select: none;
  }
  header { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; }
  header a { text-decoration: none; }
  .me {
    display: flex; align-items: center; gap: 0.5rem;
    background: #fff; box-shadow: var(--shadow); border-radius: 999px; padding: 0.25rem 0.3rem 0.25rem 0.9rem;
  }
  .mname { font-weight: 800; }
  .mscore { background: var(--me); color: #fff; border-radius: 999px; padding: 0.1rem 0.75rem; font-weight: 900; }
  main { flex: 1; padding: 0.5rem 1.1rem 1.5rem; display: flex; flex-direction: column; justify-content: center; }
  .stack { display: flex; flex-direction: column; gap: 0.8rem; }
  .center { align-items: center; text-align: center; }
  .center-text { text-align: center; }
  .card.stack { text-align: center; }
  .card p { margin: 0; }
  .code { letter-spacing: 0.4em; font-weight: 900; text-transform: uppercase; }
  .dimmed { color: var(--muted); margin: 0; }
  .bigemoji { font-size: 4.5rem; }
  .qmini { margin: 0; font-size: 1.05rem; background: #fff; border-radius: 999px; padding: 0.2rem 1rem; box-shadow: var(--shadow); }
  .answertext { font-size: 1.7rem; font-weight: 900; margin: 0; background: var(--good); color: #fff; border-radius: 999px; padding: 0.3rem 1.4rem; }

  .lengths { display: grid; gap: 0.5rem; }
  .len {
    background: #f3f3f3; border-radius: 16px; padding: 0.7rem;
    display: flex; flex-direction: column; border: 3px solid transparent;
  }
  .len b { font-weight: 900; }
  .len span { font-size: 0.85rem; color: var(--muted); }
  .len.on { border-color: var(--ring); background: #fff; }

  .buzzer {
    width: min(78vw, 340px);
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #f2f2f2, #cfcfcf 70%);
    color: #9a9a9a;
    font-size: 2.6rem;
    font-weight: 900;
    font-style: italic;
    border: 12px solid #fff;
    box-shadow: 0 14px 0 #a9a9a9, var(--shadow);
    touch-action: manipulation;
    transition: transform 0.06s, box-shadow 0.06s, background 0.15s;
  }
  .buzzer.open {
    background: radial-gradient(circle at 35% 30%, #ff6b6b, var(--red) 62%);
    color: #fff;
    box-shadow: 0 14px 0 var(--red-dark), 0 0 0 8px var(--ring), var(--shadow);
    animation: ready 0.6s ease-in-out infinite alternate;
  }
  .buzzer.open:active, .buzzer.sent {
    transform: translateY(12px);
    box-shadow: 0 2px 0 var(--red-dark);
    animation: none;
  }
  .buzzer.early { background: var(--ink); color: #fff; animation: shake 0.4s; }
  @keyframes ready { to { box-shadow: 0 14px 0 var(--red-dark), 0 0 0 16px rgba(0, 200, 232, 0.45), var(--shadow); } }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }

  .answer {
    background: #fff; border-radius: 999px; padding: 0.8rem 1.2rem 0.8rem 0.7rem;
    font-size: 1.3rem; font-weight: 800; text-align: left;
    display: flex; align-items: center; gap: 0.8rem;
    box-shadow: 0 5px 0 #cfcfcf;
  }
  .answer:active { transform: translateY(4px); box-shadow: 0 1px 0 #cfcfcf; outline: 4px solid var(--ring); }
  .letter {
    background: var(--ink); color: #fff; border-radius: 50%;
    width: 2.2rem; height: 2.2rem; display: grid; place-items: center; flex-shrink: 0;
  }
</style>
