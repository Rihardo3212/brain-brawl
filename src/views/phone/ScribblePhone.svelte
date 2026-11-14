<script>
  import { onDestroy } from 'svelte';
  import ReactBar from '../../components/ReactBar.svelte';
  import SketchPad from '../../components/SketchPad.svelte';
  import StrokeView from '../../components/StrokeView.svelte';
  import { STARTERS } from '../../content/chain.js';
  import { POINTS, kindOf, key, chainOf, authorOf } from '../../engine/scribble.js';
  import { pick } from '../../engine/util.js';
  import { sfx } from '../../lib/sound.js';

  let { s, id, send, now, react, db } = $props();

  const c = $derived(s.chain);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const making = $derived(['scwrite', 'scdraw', 'scdesc'].includes(s.phase));
  const inChain = $derived(!!c && c.order.includes(id));
  const kind = $derived(c ? kindOf(c.step) : 'write');
  const myChain = $derived(c && inChain ? chainOf(c, id, c.step) : -1);
  const done = $derived(!!c?.done?.[id]);
  const prevText = $derived(c && myChain >= 0 && c.step > 0 ? c.texts[key(myChain, c.step - 1)] : null);

  let text = $state('');
  let strokes = [];
  let sent = $state(false);
  let stepId = null;
  $effect(() => {
    const sid = c ? `${c.round}-${c.step}-${s.phase}` : null;
    if (sid !== stepId) { stepId = sid; text = ''; strokes = []; sent = false; }
  });

  // The drawing to describe (scdesc) and all drawings of the chain being voted on (scvote).
  let drawings = $state({});
  let unsub = null;
  let watching = null;
  $effect(() => {
    const path = c && (s.phase === 'scdesc' || s.phase === 'scvote') ? `rooms/${s.code}/${c.path}` : null;
    if (path === watching) return;
    unsub?.();
    unsub = null;
    watching = path;
    if (path) unsub = db.onValue(path, (v) => (drawings = v || {}));
  });
  onDestroy(() => unsub?.());
  const toDescribe = $derived(c && s.phase === 'scdesc' && myChain >= 0 ? drawings[key(myChain, c.step - 1)] : null);

  function sendText(e) {
    e.preventDefault();
    if (!text.trim() || sent) return;
    sent = true;
    sfx.pop();
    send('scstep', { text: text.trim() });
  }
  async function sendDrawing(list) {
    if (sent) return;
    sent = true;
    sfx.pop();
    navigator.vibrate?.([40, 30, 80]);
    await db.set(`rooms/${s.code}/${c.path}/${key(myChain, c.step)}`, list);
    send('scstep', {});
  }
  // Out of time: send what is there.
  $effect(() => {
    if (!c || sent || done || myChain < 0 || c.until - now > 1200) return;
    if (s.phase === 'scdraw' && strokes.length) sendDrawing(strokes);
    if ((s.phase === 'scwrite' || s.phase === 'scdesc') && text.trim()) { sent = true; send('scstep', { text: text.trim() }); }
  });

  const options = $derived(
    c && s.phase === 'scvote'
      ? Array.from({ length: c.len }, (_, k) => ({ k, kind: kindOf(k), by: authorOf(c, c.showIdx, k), text: c.texts[key(c.showIdx, k)], strokes: drawings[key(c.showIdx, k)] })).filter((o) => o.by !== id)
      : []
  );
  function vote(k) {
    sfx.pop();
    navigator.vibrate?.(30);
    send('scvote', { k });
  }
  const gained = $derived(c?.gained?.[id] || 0);
</script>

{#if c}
  {#if making && !inChain}
    <div class="stack center"><div class="bigemoji">👀</div><h2>Watch the big screen!</h2><p class="muted">You'll join the next round.</p></div>

  {:else if making && (done || sent)}
    <div class="stack center pop-in">
      <div class="bigemoji">✅</div>
      <h2>Sent!</h2>
      <p class="muted">Waiting for the others… {secs(c.until)}</p>
      <ReactBar onReact={react} />
    </div>

  {:else if s.phase === 'scwrite'}
    <form class="stack" onsubmit={sendText}>
      <p class="qmini">✍️ Start a chain · ⏱ {secs(c.until)}</p>
      <h3 class="center">Write something silly to draw</h3>
      <input class="field big" maxlength="70" placeholder="A cat driving a bus" autocomplete="off" bind:value={text} />
      <button type="button" class="btn ghost block" onclick={() => { sfx.pop(); text = pick(STARTERS); }}>🎲 Random idea</button>
      <button class="btn green big block" disabled={!text.trim()}>Send</button>
    </form>

  {:else if s.phase === 'scdraw'}
    <div class="stack">
      <p class="qmini">🎨 Draw this! · ⏱ {secs(c.until)}</p>
      <div class="prompt">“{prevText || 'Anything you like!'}”</div>
      <SketchPad frame="#a855f7" onChange={(l) => (strokes = l)} onDone={sendDrawing} doneLabel="✅ Done!" />
    </div>

  {:else if s.phase === 'scdesc'}
    <form class="stack" onsubmit={sendText}>
      <p class="qmini">🤔 What is this? · ⏱ {secs(c.until)}</p>
      <div class="center-box">
        {#if toDescribe}<StrokeView strokes={toDescribe} size={240} border="#a855f7" />
        {:else}<div class="empty">🫥 No drawing… make something up!</div>{/if}
      </div>
      <input class="field big" maxlength="70" placeholder="I think it's…" autocomplete="off" bind:value={text} />
      <button class="btn green big block" disabled={!text.trim()}>Send</button>
    </form>

  {:else if s.phase === 'scshow'}
    <div class="stack center">
      <div class="bigemoji bounce">📜</div>
      <h2>Watch the big screen!</h2>
      <ReactBar onReact={react} />
    </div>

  {:else if s.phase === 'scvote'}
    <div class="stack center">
      {#if c.tallied}
        <div class="bigemoji">{gained ? '⭐' : '👏'}</div>
        <h2>{gained ? `${gained / POINTS.vote} vote${gained > POINTS.vote ? 's' : ''} for you!` : 'Votes are in!'}</h2>
        {#if gained}<p class="pts">+{gained}</p>{/if}
        <ReactBar onReact={react} />
      {:else if c.votes[id] !== undefined || !inChain}
        <div class="bigemoji">⭐</div>
        <h3>Vote sent!</h3>
        <ReactBar onReact={react} />
      {:else}
        <p class="qmini">⭐ Your favorite step? · ⏱ {secs(c.until)}</p>
        <div class="opts">
          {#each options as o (o.k)}
            <button class="opt" onclick={() => vote(o.k)}>
              {#if o.kind === 'draw'}
                {#if o.strokes}<StrokeView strokes={o.strokes} size={110} border="#a855f7" />{:else}<span>🫥</span>{/if}
              {:else}
                <span class="ot">“{o.text || '🤷'}”</span>
              {/if}
              <span class="ob">{s.players[o.by]?.name}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
{/if}

<style>
  .qmini { margin: 0; text-align: center; }
  .center { text-align: center; margin: 0; }
  .prompt {
    font-family: var(--font-display); font-size: 1.4rem; text-align: center; color: #fff; background: #a855f7;
    border-radius: 18px; padding: 0.45rem 0.9rem; word-break: break-word;
  }
  .center-box { display: flex; justify-content: center; }
  .empty { padding: 2rem 1rem; border-radius: 18px; background: var(--surface-hi); font-weight: 900; text-align: center; }
  .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; width: 100%; }
  .opt {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem; padding: 0.5rem; min-height: 90px;
    border-radius: 18px; background: var(--surface-hi); box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.5); transition: transform 0.1s;
  }
  .opt:active { transform: translateY(3px); }
  .ot { font-family: var(--font-display); font-size: 1.1rem; word-break: break-word; }
  .ob { font-size: 0.85rem; font-weight: 800; opacity: 0.75; }
  .pts { font-family: var(--font-display); font-size: 2.2rem; color: var(--green); margin: 0; }
</style>
