<script>
  import Avatar from '../../components/Avatar.svelte';
  import ReactBar from '../../components/ReactBar.svelte';
  import { POINTS } from '../../engine/oddone.js';
  import { sfx } from '../../lib/sound.js';

  let { s, id, avatars, send, now, react } = $props();

  const o = $derived(s.odd);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const P = (pid) => ({ id: pid, ...s.players[pid] });
  const colorOf = (p) => (s.teamMode ? s.units[p.unit]?.color : p.color) || p.color;
  const spy = $derived(!!o && o.spies.includes(id));
  const others = $derived(s.order.filter((pid) => pid !== id && s.players[pid]?.unit).map(P));
  const gained = $derived(o?.gained?.[id] || 0);
  let text = $state('');
  let guess = $state('');
  let lastRound = null;
  $effect(() => { if (o && o.round !== lastRound) { lastRound = o.round; text = ''; guess = ''; } });

  function sendClue(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    sfx.pop();
    text = '';
    send('oclue', { text: t });
  }
  function vote(pid) {
    sfx.pop();
    navigator.vibrate?.(30);
    send('ovote', { pid });
  }
  function sendGuess(e) {
    e.preventDefault();
    if (!guess.trim()) return;
    sfx.pop();
    send('oguess', { text: guess.trim() });
  }
</script>

{#if o}
  {#if s.phase === 'oclue'}
    <div class="card secret" class:spy>
      <span class="cat">{o.icon} {o.cat}</span>
      {#if spy}
        <div class="bigemoji">🕵️</div>
        <h2>You're the SPY!</h2>
        <p>You don't know the word. Blend in!</p>
      {:else}
        <span class="lbl">The secret word</span>
        <h2 class="w">{o.word}</h2>
      {/if}
    </div>
    {#if o.clues[id]}
      <div class="stack center pop-in">
        <p>Your clue: <b>“{o.clues[id]}”</b></p>
        <p class="muted">Waiting for the others… {secs(o.until)}</p>
        <ReactBar onReact={react} />
      </div>
    {:else}
      <form class="stack" onsubmit={sendClue}>
        <input class="field big" maxlength="24" placeholder="One word clue" autocomplete="off" bind:value={text} />
        {#if o.rejects[id]}<p class="warn">🙅 Too close to the word! Try another.</p>{/if}
        <p class="muted tip">⏱ {secs(o.until)} · {spy ? 'Guess what fits the category…' : 'Not too obvious, or the spy learns the word!'}</p>
        <button class="btn green big block" disabled={!text.trim()}>Send clue</button>
      </form>
    {/if}

  {:else if s.phase === 'ovote'}
    <div class="stack center">
      <p class="qmini">{o.icon} {o.cat} · ⏱ {secs(o.until)}</p>
      {#if o.votes[id]}
        <div class="bigemoji">🗳️</div>
        <h3>You voted for {s.players[o.votes[id]]?.name}</h3>
        <ReactBar onReact={react} />
      {:else}
        <h3>{spy ? 'Vote for someone… act normal 😇' : 'Who is the spy?'}</h3>
        <div class="list">
          {#each others as p (p.id)}
            <button class="sus" onclick={() => vote(p.id)}>
              <Avatar src={avatars[p.id]} color={colorOf(p)} name={p.name} size={44} />
              <span class="nm">{p.name}</span>
              <span class="cl">“{o.clues[p.id] || '…'}”</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

  {:else if s.phase === 'oguess'}
    <div class="stack center">
      {#if o.caught.includes(id) && o.guesses[id] === undefined}
        <div class="bigemoji">🚨</div>
        <h2>Caught!</h2>
        <p>Guess the secret word to steal +{POINTS.steal}. ⏱ {secs(o.until)}</p>
        <form class="stack" onsubmit={sendGuess}>
          <input class="field big" maxlength="30" placeholder="The word is…" autocomplete="off" bind:value={guess} />
          <button class="btn green big block" disabled={!guess.trim()}>Guess</button>
        </form>
      {:else}
        <div class="bigemoji">🚨</div>
        <h3>{o.caught.map((p) => s.players[p]?.name).join(' & ')} {o.caught.length > 1 ? 'were' : 'was'} caught!</h3>
        <p class="muted">Now the spy gets one guess at the word…</p>
        <ReactBar onReact={react} />
      {/if}
    </div>

  {:else if s.phase === 'oresult'}
    <div class="stack center pop-in">
      {#if spy}
        <div class="bigemoji">{o.caught.includes(id) ? (o.stole[id] ? '😏' : '😵') : '😎'}</div>
        <h2>{o.caught.includes(id) ? (o.stole[id] ? 'Caught, but you guessed it!' : 'You got caught!') : 'You got away!'}</h2>
      {:else}
        <div class="bigemoji">{gained ? '🎉' : '😱'}</div>
        <h2>{gained ? 'Spy caught!' : 'The spy got away!'}</h2>
      {/if}
      <p>The word was <b>{o.word}</b> · spy: <b>{o.spies.map((p) => s.players[p]?.name).join(' & ')}</b></p>
      {#if gained}<p class="pts">+{gained}</p>{/if}
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .secret {
    display: flex; flex-direction: column; align-items: center; gap: 0.2rem; text-align: center; padding: 0.9rem 1rem; margin-bottom: 0.8rem;
  }
  .secret.spy { background: #8b5cf6; color: #fff; }
  .secret h2 { margin: 0; }
  .secret p { margin: 0; }
  .cat { font-weight: 900; font-size: 1.05rem; }
  .lbl { font-size: 0.85rem; font-weight: 800; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.06em; }
  .w { font-family: var(--font-display); font-weight: 400; font-size: 2.4rem; }
  .warn { margin: 0; color: #ff3b4f; font-weight: 900; text-align: center; }
  .tip { margin: 0; font-size: 0.9rem; text-align: center; }
  .qmini { margin: 0; }
  .list { display: flex; flex-direction: column; gap: 0.45rem; width: 100%; }
  .sus {
    display: flex; align-items: center; gap: 0.6rem; padding: 0.45rem 0.8rem; border-radius: 18px; text-align: left;
    background: var(--surface-hi); box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.5); transition: transform 0.1s;
  }
  .sus:active { transform: translateY(3px); }
  .nm { font-weight: 900; }
  .cl { margin-left: auto; font-family: var(--font-display); font-size: 1.2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 50%; }
  .pts { font-family: var(--font-display); font-size: 2.2rem; color: var(--green); margin: 0; }
</style>
