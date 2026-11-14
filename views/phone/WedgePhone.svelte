<script>
  import ReactBar from '../../components/ReactBar.svelte';
  import Pie from '../../components/Pie.svelte';
  import { WEDGES } from '../../content/wedges.js';

  let { s, myUnit, unit, send, now, react } = $props();
  let num = $state('');
  const w = $derived(s.wedge);
  const cat = $derived(w?.spin ? WEDGES[w.spin.to] : null);
  const mine = $derived(w?.answers?.[myUnit]);
  const res = $derived(w?.results?.[myUnit]);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : n);

  $effect(() => { if (s.phase === 'spin') num = ''; });
  function sendNum(e) {
    e.preventDefault();
    const n = Number(String(num).replace(',', '.').replace(/\s/g, ''));
    if (Number.isFinite(n) && String(num).trim() !== '') send('wAnswer', { n });
  }
</script>

{#if w && unit}
  {#if s.phase === 'spin'}
    <div class="stack center">
      <div class="bigemoji spin">🎡</div>
      <h2>Spinning the wheel…</h2>
      <div class="card mypie"><Pie wedges={unit.wedges} size={90} /><span>{Object.keys(unit.wedges).length} / {w.need} wedges</span></div>
      <ReactBar onReact={react} />
    </div>

  {:else if s.phase === 'wq' && w.q && cat}
    {#if mine}
      <div class="stack center pop-in">
        <div class="bigemoji">🔒</div>
        <h2>Locked in!</h2>
        <p class="answertext">{w.q.type === 'mc' ? w.q.options[mine.i] : fmt(mine.n)}</p>
        <p class="muted">Waiting for the others… {secs(w.until)}</p>
      </div>
    {:else}
      <div class="stack">
        <p class="qmini" style="background:{cat.color}; color:#fff">{cat.icon} {cat.name} · ⏱ {secs(w.until)}</p>
        <h3 class="center-text">{w.q.text}</h3>
        {#if w.q.type === 'mc'}
          {#each w.q.options as o, i}
            <button class="opt" onclick={() => { navigator.vibrate?.(30); send('wAnswer', { i }); }}><span class="coin l{i}">{'ABCD'[i]}</span>{o}</button>
          {/each}
        {:else}
          <form class="card stack" onsubmit={sendNum}>
            <input class="field big" inputmode="decimal" placeholder="Your guess" bind:value={num} />
            {#if w.q.unit}<span class="muted center-text">in {w.q.unit}</span>{/if}
            <button class="btn blue big block" disabled={String(num).trim() === ''}>Lock guess</button>
          </form>
        {/if}
      </div>
    {/if}

  {:else if s.phase === 'wreveal' && w.q && cat}
    <div class="stack center pop-in">
      {#if w.winner === myUnit}
        <div class="bigemoji">🥧</div>
        <h2>You got the {cat.name} wedge!</h2>
      {:else}
        <div class="bigemoji">{res?.ok ? '✅' : '😬'}</div>
        <h2>{res?.ok ? 'Correct!' : mine ? 'Not this time' : 'Too slow!'}</h2>
      {/if}
      {#if res?.pts}<p class="pts">+{res.pts}</p>{/if}
      <p class="muted">The answer was</p>
      <p class="answertext">{fmt(w.q.answer)} {w.q.type === 'num' ? w.q.unit : ''}</p>
      <div class="card mypie"><Pie wedges={unit.wedges} size={80} glow={w.winner === myUnit ? cat.id : null} /><span>{Object.keys(unit.wedges).length} / {w.need}</span></div>
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .mypie { display: flex; align-items: center; gap: 0.8rem; font-family: var(--font-display); font-size: 1.3rem; padding: 0.6rem 1.2rem; }
  .field.big { font-size: 2rem; }
  .pts { font-family: var(--font-display); font-size: 2rem; color: var(--green); margin: 0; }
</style>
