<script>
  import ReactBar from '../../components/ReactBar.svelte';

  let { s, myUnit, send, now, react } = $props();
  let lie = $state('');
  let rejected = $state(false);
  const f = $derived(s.fake);
  const parts = $derived(f ? f.text.split('____') : ['', '']);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));

  // "too true" feedback when the engine rejects a lie that matches the real answer
  let lastRejects = 0;
  $effect(() => {
    const r = f?.rejects?.[myUnit] || 0;
    if (r > lastRejects) { rejected = true; navigator.vibrate?.([60, 40, 60]); setTimeout(() => (rejected = false), 2500); }
    lastRejects = r;
  });
  let lastRound = null;
  $effect(() => { if (f && f.round !== lastRound) { lastRound = f.round; lie = ''; lastRejects = f.rejects?.[myUnit] || 0; } });

  function submit(e) {
    e.preventDefault();
    if (lie.trim()) send('lie', { text: lie });
  }
</script>

{#if f}
  {#if s.phase === 'lie'}
    {#if f.lies[myUnit]}
      <div class="stack center pop-in">
        <div class="bigemoji">🤫</div>
        <h2>Lie locked in!</h2>
        <p class="answertext lie">{f.lies[myUnit].text}</p>
        <p class="muted">Waiting for the other liars… {secs(f.until)}</p>
        <ReactBar onReact={react} />
      </div>
    {:else}
      <div class="stack">
        <p class="qmini">🤥 Fact {f.round} of {f.rounds} · ⏱ {secs(f.until)}</p>
        <div class="card prompt">{parts[0]}<span class="blank">_____</span>{parts[1]}</div>
        <form class="card stack" onsubmit={submit}>
          <label class="muted center-text" for="lie">Write a fake answer that sounds real</label>
          <input id="lie" class="field" maxlength="40" autocomplete="off" placeholder="Your lie" bind:value={lie} />
          {#if rejected}<p class="warn shake">😅 That's actually the real answer! Write a fake one.</p>{/if}
          <button class="btn purple big block" disabled={!lie.trim()}>Lock my lie</button>
        </form>
      </div>
    {/if}

  {:else if s.phase === 'pick'}
    {#if f.picks[myUnit]}
      {@const o = f.options.find((x) => x.id === f.picks[myUnit].id)}
      <div class="stack center pop-in">
        <div class="bigemoji">🕵️</div>
        <h2>Your pick:</h2>
        <p class="answertext">{o?.text}</p>
        <p class="muted">Waiting… {secs(f.until)}</p>
      </div>
    {:else}
      <div class="stack">
        <p class="qmini">🕵️ Find the truth · ⏱ {secs(f.until)}</p>
        <div class="card prompt small">{parts[0]}<span class="blank">_____</span>{parts[1]}</div>
        {#each f.options as o, i (o.id)}
          {@const mine = o.authors.includes(myUnit)}
          <button class="opt" class:faded={mine} disabled={mine} onclick={() => { navigator.vibrate?.(30); send('fpick', { id: o.id }); }}>
            <span class="coin l{i % 4}">{i + 1}</span>{o.text}{#if mine}<span class="yours">your lie</span>{/if}
          </button>
        {/each}
      </div>
    {/if}

  {:else if s.phase === 'freveal'}
    <div class="stack center">
      <div class="bigemoji bounce">👀</div>
      <h2>Look at the big screen!</h2>
      {#if f.gained[myUnit]}<p class="pts pop-in">+{f.gained[myUnit]}</p>{/if}
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .prompt { font-size: 1.25rem; font-weight: 800; text-align: center; line-height: 1.35; }
  .prompt.small { font-size: 1.05rem; }
  .blank { color: var(--purple); border-bottom: 3px dashed var(--purple); padding: 0 0.3em; }
  .warn { color: var(--sun); margin: 0; font-weight: 900; text-align: center; }
  .lie { background: var(--purple); box-shadow: 0 8px 20px -6px color-mix(in srgb, var(--purple) 70%, transparent); }
  .yours { margin-left: auto; font-size: 0.8rem; color: var(--purple); font-weight: 900; }
  .pts { font-family: var(--font-display); font-size: 2.2rem; color: var(--green); margin: 0; }
</style>
