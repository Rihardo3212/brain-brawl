<script>
  import Avatar from '../../components/Avatar.svelte';
  import ReactBar from '../../components/ReactBar.svelte';
  import { POINTS } from '../../engine/whowrote.js';
  import { sfx } from '../../lib/sound.js';

  let { s, id, avatars, send, now, react } = $props();

  const w = $derived(s.who);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const P = (pid) => ({ id: pid, ...s.players[pid] });
  const colorOf = (p) => (s.teamMode ? s.units[p.unit]?.color : p.color) || p.color;
  const mineNow = $derived(w && w.queue[w.idx] === id);
  const myGuess = $derived(w?.guesses?.[id]);
  let text = $state('');
  let lastRound = null;
  $effect(() => { if (w && w.round !== lastRound) { lastRound = w.round; text = ''; } });

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    sfx.pop();
    send('wwrite', { text: text.trim() });
  }
  function pick(pid) {
    sfx.pop();
    navigator.vibrate?.(30);
    send('wguess', { pid });
  }
  const gained = $derived(w?.gained?.[id] || 0);
</script>

{#if w}
  {#if s.phase === 'wwrite'}
    {#if w.answers[id]}
      <div class="stack center pop-in">
        <div class="bigemoji">🤫</div>
        <h2>“{w.answers[id]}”</h2>
        <p class="muted">Sent! Waiting for the others… {secs(w.until)}</p>
        <ReactBar onReact={react} />
      </div>
    {:else}
      <form class="stack" onsubmit={submit}>
        <p class="qmini">📝 Prompt {w.round} of {w.rounds} · ⏱ {secs(w.until)}</p>
        <h3 class="prompt">{w.prompt}</h3>
        <input class="field big" maxlength="60" placeholder="Your answer" autocomplete="off" bind:value={text} />
        <p class="muted tip">Be honest… or try to sound like someone else 😈</p>
        <button class="btn green big block" disabled={!text.trim()}>Send</button>
      </form>
    {/if}

  {:else if s.phase === 'wguess'}
    <div class="stack center">
      <p class="qmini">Answer {w.idx + 1} of {w.queue.length} · ⏱ {secs(w.until)}</p>
      <div class="answer">“{w.text}”</div>
      {#if mineNow}
        <div class="bigemoji">😏</div>
        <h3>That's yours! Keep a straight face.</h3>
      {:else if myGuess}
        <p>You guessed <b>{s.players[myGuess]?.name}</b>. Waiting…</p>
        <ReactBar onReact={react} />
      {:else}
        <h3>Who wrote that?</h3>
        <div class="grid">
          {#each w.queue.filter((pid) => pid !== id) as pid (pid)}
            {@const p = P(pid)}
            <button class="who" onclick={() => pick(pid)}>
              <Avatar src={avatars[pid]} color={colorOf(p)} name={p.name} size={54} />
              <span>{p.name}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

  {:else if s.phase === 'wshow'}
    <div class="stack center pop-in">
      {#if w.author === id}
        <div class="bigemoji">{gained ? '😈' : '🙈'}</div>
        <h2>{gained ? `You fooled ${gained / POINTS.fooled}!` : 'They saw right through you!'}</h2>
      {:else if myGuess === w.author}
        <div class="bigemoji">🎯</div>
        <h2>Right! It was {s.players[w.author]?.name}.</h2>
      {:else}
        <div class="bigemoji">😅</div>
        <h2>It was {s.players[w.author]?.name}!</h2>
      {/if}
      {#if gained}<p class="pts">+{gained}</p>{/if}
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .qmini { margin: 0; text-align: center; }
  .prompt { margin: 0; font-size: 1.4rem; line-height: 1.25; }
  .tip { margin: 0; font-size: 0.9rem; }
  .answer {
    font-family: var(--font-display); font-size: 1.7rem; text-align: center; color: #fff; background: #14b8a6;
    border-radius: 20px; padding: 0.6rem 1rem; width: 100%; word-break: break-word;
  }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; width: 100%; }
  .who {
    display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.6rem 0.3rem; border-radius: 18px;
    background: var(--surface-hi); box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.5); font-weight: 900; transition: transform 0.1s;
  }
  .who:active { transform: translateY(3px); }
  .who span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.9rem; }
  .pts { font-family: var(--font-display); font-size: 2.2rem; color: var(--green); margin: 0; }
</style>
