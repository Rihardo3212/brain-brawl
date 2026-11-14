<script>
  import ReactBar from '../../components/ReactBar.svelte';
  import SketchPad from '../../components/SketchPad.svelte';
  import { sfx } from '../../lib/sound.js';

  let { s, id, myUnit, send, now, react, db } = $props();

  const m = $derived(s.sketch);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const done = $derived(!!m?.done?.[id]);
  let strokes = [];
  let sent = $state(false);
  let lastRound = null;
  $effect(() => { if (m && m.round !== lastRound) { lastRound = m.round; strokes = []; sent = false; } });

  async function submit(list) {
    if (sent) return;
    sent = true;
    sfx.pop();
    navigator.vibrate?.([40, 30, 80]);
    await db.set(`rooms/${s.code}/${m.path}/${id}`, list);
    send('mdone');
  }
  // Out of time: send what is drawn so far.
  $effect(() => { if (s.phase === 'mdraw' && !sent && strokes.length && m.until - now < 1200) submit(strokes); });

  const res = $derived(m?.results?.[id]);
  const counted = $derived(m?.best?.[myUnit] === id);
</script>

{#if m}
  {#if s.phase === 'mlook'}
    <div class="stack center pop-in">
      <div class="bigemoji bounce">👀</div>
      <h2>Look at the big screen!</h2>
      <p class="muted">Remember the drawing. You'll draw it from memory.</p>
    </div>

  {:else if s.phase === 'mdraw'}
    {#if done || sent}
      <div class="stack center pop-in">
        <div class="bigemoji">✅</div>
        <h2>Drawing sent!</h2>
        <p class="muted">Waiting for the others… {secs(m.until)}</p>
        <ReactBar onReact={react} />
      </div>
    {:else}
      <div class="stack">
        <p class="qmini">🧠 Draw it from memory! · ⏱ {secs(m.until)}</p>
        <SketchPad colors={['#2b2240']} frame="#ec4899" onChange={(l) => (strokes = l)} onDone={submit} doneLabel="✅ Done!" />
      </div>
    {/if}

  {:else if s.phase === 'mreveal'}
    <div class="stack center pop-in">
      {#if res}
        <div class="bigemoji">{res.pts >= 700 ? '🤩' : res.pts >= 400 ? '👍' : '😅'}</div>
        <h2>{res.pts >= 700 ? 'Great memory!' : res.pts >= 400 ? 'Not bad!' : 'Hmm, close-ish?'}</h2>
        {#if counted}<p class="pts">+{res.pts}</p>{:else}<p class="muted">{res.pts} points. A teammate's drawing counted.</p>{/if}
      {:else}
        <div class="bigemoji">🫥</div>
        <h2>No drawing this time</h2>
      {/if}
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .qmini { margin: 0; text-align: center; }
  .pts { font-family: var(--font-display); font-size: 2.2rem; color: var(--green); margin: 0; }
</style>
