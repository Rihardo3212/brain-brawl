<script>
  import Avatar from '../../components/Avatar.svelte';
  import LiveCanvas from '../../components/LiveCanvas.svelte';
  import ReactBar from '../../components/ReactBar.svelte';
  import { DIFFICULTY } from '../../content/doodle.js';
  import { sfx } from '../../lib/sound.js';

  let { s, id, avatars, send, now, react, db } = $props();
  let guess = $state('');
  let closeFlash = $state(false);
  const d = $derived(s.doodle);
  const amArtist = $derived(d?.drawer === id);
  const artist = $derived(d?.drawer ? { id: d.drawer, ...s.players[d.drawer] } : null);
  const mine = $derived(d?.guessed?.[id]);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));

  let lastClose = 0;
  $effect(() => {
    const c = d?.close?.[id] || 0;
    if (c > lastClose) { closeFlash = true; navigator.vibrate?.(40); setTimeout(() => (closeFlash = false), 1800); }
    lastClose = c;
  });
  let lastRound = null;
  $effect(() => { if (d && d.round !== lastRound) { lastRound = d.round; guess = ''; lastClose = d.close?.[id] || 0; } });
  let wasGuessed = false;
  $effect(() => { if (mine && !wasGuessed) { sfx.correct(); navigator.vibrate?.([40, 30, 120]); } wasGuessed = !!mine; });

  function submit(e) {
    e.preventDefault();
    if (!guess.trim()) return;
    send('guess', { text: guess });
    guess = '';
  }
</script>

{#if d && artist}
  {#if s.phase === 'dchoose'}
    {#if amArtist}
      <div class="stack">
        <h2 class="center-text">🎨 You're the artist!</h2>
        <p class="muted center-text">Pick a word to draw · {secs(d.until)}</p>
        {#each d.choices as c, i}
          <button class="word {c.diff}" onclick={() => { sfx.pop(); send('dChoose', { i }); }}>
            <span class="w">{c.word}</span>
            <span class="dl">{DIFFICULTY[c.diff].label} · ×{DIFFICULTY[c.diff].mult}</span>
          </button>
        {/each}
      </div>
    {:else}
      <div class="stack center">
        <Avatar src={avatars[artist.id]} color={artist.color} name={artist.name} size={110} />
        <h2>{artist.name} is picking a word…</h2>
        <ReactBar onReact={react} />
      </div>
    {/if}

  {:else if s.phase === 'ddraw'}
    {#if amArtist}
      <div class="stack center">
        <p class="qmini">Draw: <b class="secret">{d.word}</b> · ⏱ {secs(d.until)}</p>
        {#key d.round}
          <LiveCanvas {db} path={`rooms/${s.code}/${d.canvas}`} color={artist.color} />
        {/key}
        <p class="muted">{Object.keys(d.guessed).length} guessed it · no letters or numbers!</p>
      </div>
    {:else}
      <div class="stack">
        <div class="peek">
          {#key d.round}
            <LiveCanvas {db} path={`rooms/${s.code}/${d.canvas}`} color={artist.color} readOnly />
          {/key}
        </div>
        <div class="hint">{d.hint}</div>
        {#if mine}
          <div class="card center stack pop-in">
            <h2>✅ You got it!</h2>
            <p class="pts">+{mine.pts}</p>
          </div>
          <ReactBar onReact={react} />
        {:else}
          <form class="card stack" onsubmit={submit}>
            <input class="field" maxlength="30" autocomplete="off" autocapitalize="off" placeholder="Your guess" bind:value={guess} />
            {#if closeFlash}<p class="close shake">🔥 So close!</p>{/if}
            <button class="btn green big block" disabled={!guess.trim()}>Guess · {secs(d.until)}</button>
          </form>
        {/if}
      </div>
    {/if}

  {:else if s.phase === 'dreveal'}
    <div class="stack center pop-in">
      <p class="muted">The word was</p>
      <p class="answertext">{d.reveal}</p>
      {#if amArtist}
        <p class="pts">+{d.artistPts || 0} for your art</p>
      {:else if mine}
        <p class="pts">+{mine.pts}</p>
      {:else}
        <div class="bigemoji">😅</div>
      {/if}
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .word {
    display: flex; flex-direction: column; align-items: center; gap: 0.1rem;
    border-radius: 22px; padding: 0.8rem; color: #fff;
    --c: var(--green); --cd: var(--green-dark);
    background: var(--c);
    box-shadow: 0 6px 0 var(--cd);
  }
  .word:active { transform: translateY(4px); box-shadow: 0 2px 0 var(--cd); }
  .word.medium { --c: var(--blue); --cd: var(--blue-dark); }
  .word.hard { --c: var(--purple); --cd: var(--purple-dark); }
  .w { font-family: var(--font-display); font-size: 1.8rem; text-shadow: 0 2px 0 rgba(0, 0, 0, 0.2); }
  .dl { font-weight: 900; opacity: 0.9; }
  .secret { font-family: var(--font-display); font-weight: 400; font-size: 1.3rem; color: var(--red); text-transform: uppercase; }
  .peek { width: 62%; align-self: center; }
  .hint { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.22em; text-align: center; white-space: pre-wrap; }
  .close { color: var(--sun); margin: 0; font-weight: 900; text-align: center; }
  .pts { font-family: var(--font-display); font-size: 2rem; color: var(--green); margin: 0; }
</style>
