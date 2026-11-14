<script>
  import ReactBar from '../../components/ReactBar.svelte';
  import { formatNum, questionById } from '../../engine/closest.js';
  import { sfx } from '../../lib/sound.js';

  let { s, id, myUnit, send, now, react } = $props();

  const c = $derived(s.close);
  const q = $derived(c ? questionById(c.id) : null);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const mine = $derived(c?.guesses?.[id]);
  const locked = $derived(mine !== undefined);
  const fmt = (n) => formatNum(n, q);
  let num = $state('');
  let sent = false;

  // New question = empty box.
  let lastRound = null;
  $effect(() => { if (c && c.round !== lastRound) { lastRound = c.round; num = ''; sent = false; } });

  const value = $derived.by(() => {
    const t = String(num).trim().replace(/[\s']/g, '');
    if (!t) return null;
    // "1,5" means 1.5; "10,000" means 10000.
    const clean = /^\d{1,3}(,\d{3})+$/.test(t) ? t.replace(/,/g, '') : t.replace(',', '.');
    const n = Number(clean);
    return Number.isFinite(n) ? n : null;
  });

  function lock(e) {
    e?.preventDefault();
    if (value === null || sent) return;
    sent = true;
    sfx.pop();
    navigator.vibrate?.([40, 30, 80]);
    send('cguess', { n: value });
  }
  // Out of time with a number typed? Send it for them.
  $effect(() => { if (s.phase === 'cguess' && value !== null && !locked && c.until - now < 1200) lock(); });

  const res = $derived(c?.results?.[id]);
  const counted = $derived(c?.best?.[myUnit] === id);
</script>

{#if c && q}
  {#if s.phase === 'cguess'}
    {#if locked}
      <div class="stack center pop-in">
        <div class="bigemoji">🔒</div>
        <h2>Locked in: {fmt(mine)}{c.unit ? ` ${c.unit}` : ''}</h2>
        <p class="muted">Waiting for the others… {secs(c.until)}</p>
        <ReactBar onReact={react} />
      </div>
    {:else}
      <form class="stack" onsubmit={lock}>
        <p class="qmini">🎯 Question {c.round} of {c.rounds}{c.double ? ' · ×2' : ''} · ⏱ {secs(c.until)}</p>
        <h3 class="qtext">{c.q}</h3>
        <div class="inrow">
          <input class="field big" inputmode={c.year ? 'numeric' : 'decimal'} placeholder={c.year ? 'Year' : 'Your guess'} autocomplete="off" bind:value={num} />
          {#if c.unit}<span class="unit">{c.unit}</span>{/if}
        </div>
        <button class="btn blue big block" disabled={value === null}>🔒 Lock guess</button>
      </form>
    {/if}

  {:else if s.phase === 'creveal'}
    <div class="stack center pop-in">
      <p class="muted">The answer is</p>
      <div class="answer">{fmt(c.answer)}{c.unit ? ` ${c.unit}` : ''}</div>
      {#if mine !== undefined && res}
        <p class="yours">You said {fmt(mine)}{res.spot ? ' 🎯 Spot on!' : ''}</p>
        {#if counted}<p class="pts">+{res.pts}</p>{:else}<p class="muted">{res.pts >= (c.gained[myUnit] || 0) ? "Tied with a teammate, theirs counted." : "A teammate was closer."}</p>{/if}
      {:else}
        <p class="muted">No guess this time.</p>
      {/if}
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .qmini { margin: 0; }
  .qtext { margin: 0; font-size: 1.35rem; line-height: 1.25; }
  .inrow { display: flex; align-items: center; gap: 0.6rem; }
  .inrow .field { flex: 1; min-width: 0; text-align: center; font-size: 1.8rem; }
  .unit { font-weight: 900; font-size: 1.1rem; max-width: 40%; }
  .answer {
    font-family: var(--font-display); font-size: 2.4rem; color: #fff; background: var(--green); border-radius: 20px;
    padding: 0.1rem 1.1rem 0.25rem; box-shadow: 0 10px 26px -6px color-mix(in srgb, var(--green) 70%, transparent);
  }
  .yours { font-weight: 900; font-size: 1.2rem; margin: 0; }
  .pts { font-family: var(--font-display); font-size: 2.2rem; color: var(--green); margin: 0; }
</style>
