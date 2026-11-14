<script>
  import PinMap from '../../components/PinMap.svelte';
  import ReactBar from '../../components/ReactBar.svelte';
  import { formatKm, BULLSEYE_KM } from '../../engine/pindrop.js';
  import { sfx } from '../../lib/sound.js';

  let { s, id, myUnit, unit, send, now, react } = $props();

  const f = $derived(s.pin);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const locked = $derived(!!f?.pins[id]);
  const me = $derived(s.players[id]);
  let spot = $state(null);
  let sent = false;

  // New photo = fresh map.
  let lastRound = null;
  $effect(() => { if (f && f.round !== lastRound) { lastRound = f.round; spot = null; sent = false; } });

  function pick(ll) {
    spot = ll;
    sfx.pop();
    navigator.vibrate?.(20);
  }
  function lock() {
    if (!spot || sent) return;
    sent = true;
    navigator.vibrate?.([40, 30, 80]);
    send('pin', { lat: spot.lat, lng: spot.lng });
  }
  // Someone else locked in: the clock just sped up.
  let rushed = $state(false);
  let lastRush = 0;
  let rushTimer;
  $effect(() => {
    const r = f?.rush || 0;
    if (r > lastRush && f.rushBy !== id && !locked) {
      rushed = true;
      navigator.vibrate?.([30, 30, 30]);
      clearTimeout(rushTimer);
      rushTimer = setTimeout(() => (rushed = false), 2500);
    }
    lastRush = r;
  });

  // Out of time with a pin on the map? Lock it in for them.
  $effect(() => { if (s.phase === 'pguess' && spot && !locked && f.until - now < 1200) lock(); });

  const res = $derived(f?.results?.[id]);
  const counted = $derived(f?.best?.[myUnit] === id);
</script>

{#if f}
  {#if s.phase === 'pguess'}
    {#if locked}
      <div class="stack center pop-in">
        <div class="bigemoji">📍</div>
        <h2>Pin locked in!</h2>
        <p class="muted">Waiting for the others… {secs(f.until)}</p>
        {#if f.hint}<p class="hint">🧭 Hint: {f.hint}</p>{/if}
        <ReactBar onReact={react} />
      </div>
    {:else}
      <div class="wrap">
        <p class="qmini" class:hot={f.rush > 0}>📍 Photo {f.round} of {f.rounds}{f.double ? ' · ×2' : ''} · ⏱ {secs(f.until)}</p>
        {#if rushed}<p class="rushmsg shake">⏩ {s.players[f.rushBy]?.name || 'Someone'} locked in. Hurry!</p>
        {:else if f.hint}<p class="hint pop-in">🧭 Hint: {f.hint}</p>{/if}
        <div class="mapbox">
          <PinMap mode="pick" color={unit?.color || me?.color} value={spot} onPick={pick} />
        </div>
        <button class="btn green big block" disabled={!spot} onclick={lock}>
          {spot ? '📍 Lock in my pin' : 'Tap the map to pin'}
        </button>
      </div>
    {/if}

  {:else if s.phase === 'preveal'}
    <div class="stack center pop-in">
      <div class="bigemoji bounce">👀</div>
      <h2>{f.answer?.name}</h2>
      <p class="muted">{f.answer?.where}</p>
      {#if res}
        <p class="dist">{res.km <= BULLSEYE_KM ? '🎯 Bullseye!' : `${formatKm(res.km)} away`}</p>
        {#if counted}<p class="pts">+{res.pts}</p>{:else}<p class="muted">A teammate was closer.</p>{/if}
      {:else}
        <p class="muted">No pin this time.</p>
      {/if}
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .wrap { display: flex; flex-direction: column; gap: 0.6rem; }
  .qmini { margin: 0; }
  .mapbox { height: calc(100dvh - 250px); min-height: 300px; border-radius: 22px; box-shadow: 0 10px 26px -8px rgba(0, 0, 0, 0.5); }
  .qmini.hot { color: #ff8a1f; }
  .rushmsg { margin: 0; text-align: center; font-weight: 900; color: #fff; background: #ff8a1f; border-radius: 12px; padding: 0.2rem 0.6rem; }
  .hint { margin: 0; text-align: center; font-weight: 900; color: var(--sun); }
  .dist { font-family: var(--font-display); font-size: 1.7rem; margin: 0; }
  .pts { font-family: var(--font-display); font-size: 2.2rem; color: var(--green); margin: 0; }
</style>
