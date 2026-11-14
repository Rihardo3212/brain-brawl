<script>
  // Reflex Rumble on the phone. All timing happens here (performance.now), so wifi lag doesn't matter.
  import { onDestroy } from 'svelte';
  import ReactBar from '../../components/ReactBar.svelte';
  import { GAMES, MASH_TIME, SHAKE_TIME, STOP_TARGET, STOP_HIDE, GREEN_WINDOW, TAP_AS_SHAKE, formatResult } from '../../engine/reflex.js';
  import { sfx } from '../../lib/sound.js';

  let { s, id, myUnit, send, react } = $props();

  const r = $derived(s.reflex);
  const game = $derived(r ? GAMES[r.game] : null);
  const mine = $derived(r?.results?.[id]);

  let t = $state(0); // ms since this phone saw "go"
  let startAt = 0;
  let timer = null;
  let sent = $state(false);
  let local = $state(null); // what this phone sends, shown right away
  let taps = $state(0);
  let tooEarly = $state(false);

  // Shake sensor
  let motionOk = $state(false);
  let needsPermission = $state(typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function');
  let power = 0;
  let lastA = null;
  function onMotion(e) {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x === null) return;
    motionOk = true;
    if (s.phase === 'rgo' && r?.game === 'shake' && !sent && t < SHAKE_TIME) {
      if (lastA) power += Math.hypot(a.x - lastA.x, a.y - lastA.y, a.z - lastA.z);
    }
    lastA = { x: a.x, y: a.y, z: a.z };
  }
  if (typeof window !== 'undefined') window.addEventListener('devicemotion', onMotion);
  async function askMotion() {
    try {
      const res = await DeviceMotionEvent.requestPermission();
      needsPermission = false;
      if (res !== 'granted') motionOk = false;
    } catch { needsPermission = false; }
  }

  // A plain timer, not requestAnimationFrame: it keeps running even when the browser
  // slows down drawing, so mash and shake always end on time.
  function loop() {
    t = performance.now() - startAt;
    checkEnd();
  }

  // A new "go": reset and start this phone's own clock.
  let goKey = null;
  $effect(() => {
    const key = r && s.phase === 'rgo' ? `${r.round}` : null;
    if (key === goKey) return;
    goKey = key;
    clearInterval(timer);
    sent = false;
    local = null;
    taps = 0;
    power = 0;
    lastA = null;
    tooEarly = false;
    if (key) {
      startAt = performance.now();
      t = 0;
      timer = setInterval(loop, 25);
    }
  });
  onDestroy(() => { clearInterval(timer); window.removeEventListener('devicemotion', onMotion); });

  function finish(data) {
    if (sent) return;
    sent = true;
    clearInterval(timer);
    local = data;
    send('rres', data);
  }

  function checkEnd() {
    if (sent || !r) return;
    if (r.game === 'green' && t > r.delay + GREEN_WINDOW) finish({ miss: true });
    if (r.game === 'mash' && t >= MASH_TIME) { finish({ v: taps }); sfx.ding(); }
    if (r.game === 'stop5' && t > 9000) finish({ miss: true });
    if (r.game === 'shake' && t >= SHAKE_TIME) {
      finish(motionOk ? { v: Math.round(power / 10) } : { v: taps * TAP_AS_SHAKE, alt: true });
      sfx.ding();
    }
  }

  function tap(e) {
    e.preventDefault();
    if (sent || s.phase !== 'rgo' || !r) return;
    const now = performance.now() - startAt;
    if (r.game === 'green') {
      if (now < r.delay) { tooEarly = true; navigator.vibrate?.(200); finish({ foul: true }); }
      else { navigator.vibrate?.(30); finish({ v: Math.round(now - r.delay) }); }
    } else if (r.game === 'mash' || (r.game === 'shake' && !motionOk)) {
      if (now < MASH_TIME) { taps += 1; navigator.vibrate?.(8); }
    } else if (r.game === 'stop5') {
      navigator.vibrate?.(40);
      finish({ v: Math.round(now) });
    }
  }

  const green = $derived(r?.game === 'green' && t >= r.delay);
  const left = (ms) => Math.max(0, (ms - t) / 1000).toFixed(1);
</script>

{#if r && game}
  {#if s.phase === 'rready'}
    <div class="stack center pop-in">
      <span class="icon-tile" style="--sz:90px; --mc:#f97316">{game.icon}</span>
      <h2>{game.name}</h2>
      <p class="how">{game.how}</p>
      {#if r.game === 'shake' && needsPermission}
        <button class="btn sun big block" onclick={askMotion}>📳 Allow shake</button>
      {/if}
      <p class="muted">Get ready…</p>
    </div>

  {:else if s.phase === 'rgo'}
    {#if sent || mine}
      <div class="stack center pop-in">
        <div class="bigemoji">{local?.foul || mine?.foul ? '🚫' : '⚡'}</div>
        <h2>{formatResult(r.game, mine || local)}</h2>
        <p class="muted">Waiting for the others…</p>
      </div>
    {:else if r.game === 'green'}
      <button class="pad" class:go={green} onpointerdown={tap}>
        <span class="big">{green ? 'TAP!' : 'Wait…'}</span>
        <span class="small">{green ? '' : "Don't tap yet!"}</span>
      </button>
    {:else if r.game === 'mash' || (r.game === 'shake' && !motionOk)}
      <button class="pad mash" onpointerdown={tap}>
        <span class="big">{taps}</span>
        <span class="small">{r.game === 'shake' ? 'No shake sensor: TAP!' : 'TAP TAP TAP!'} · {left(MASH_TIME)} s</span>
      </button>
    {:else if r.game === 'stop5'}
      <button class="pad stop" onpointerdown={tap}>
        <span class="big">{t < STOP_HIDE ? (t / 1000).toFixed(2) : '?.??'}</span>
        <span class="small">Tap at exactly {(STOP_TARGET / 1000).toFixed(2)} s</span>
      </button>
    {:else}
      <div class="pad shake">
        <span class="big wobble">📳</span>
        <span class="small">SHAKE! · {left(SHAKE_TIME)} s</span>
      </div>
    {/if}

  {:else if s.phase === 'rresult'}
    <div class="stack center pop-in">
      <div class="bigemoji">{r.points[id] === 1000 ? '🥇' : r.points[id] ? '👏' : '😵'}</div>
      <h2>{formatResult(r.game, mine)}</h2>
      {#if r.points[id] && r.best[myUnit] === id}<p class="pts">+{r.points[id]}</p>
      {:else if r.points[id]}<p class="muted">{r.points[id]} points. A teammate did better.</p>{/if}
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .how { font-size: 1.2rem; font-weight: 800; margin: 0; text-align: center; }
  .pad {
    width: 100%; height: calc(100dvh - 160px); min-height: 300px; border-radius: 32px; border: none;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem;
    background: var(--red); color: #fff; touch-action: manipulation; user-select: none;
    box-shadow: 0 14px 30px -10px rgba(0, 0, 0, 0.6);
  }
  .pad.go { background: var(--green); }
  .pad.mash { background: #f97316; }
  .pad.mash:active { transform: scale(0.98); }
  .pad.stop { background: var(--blue); }
  .pad.shake { background: var(--purple); }
  .big { font-family: var(--font-display); font-size: 5rem; line-height: 1; }
  .small { font-weight: 900; font-size: 1.1rem; opacity: 0.9; }
  .wobble { animation: wob 0.25s ease-in-out infinite alternate; }
  @keyframes wob { from { transform: rotate(-14deg); } to { transform: rotate(14deg); } }
  .pts { font-family: var(--font-display); font-size: 2.2rem; color: var(--green); margin: 0; }
</style>
