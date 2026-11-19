<script>
  import ReactBar from '../../components/ReactBar.svelte';
  import { sfx } from '../../lib/sound.js';

  let { s, id, myUnit, send, now, react } = $props();

  const l = $derived(s.line);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const locked = $derived(!!l?.orders?.[id]);
  const card = (cid) => l.cards.find((c) => c.id === cid);

  // Tap cards from oldest to newest. Tap a placed card to take it back.
  // Picks are tied to their round, so a new round starts empty right away
  // (resetting them in an effect let the first render draw last round's cards and crash).
  let pick = $state({ round: null, ids: [] });
  let sentRound = null;
  const picked = $derived(l && pick.round === l.round ? pick.ids.filter((cid) => l.cards.some((c) => c.id === cid)) : []);

  const left = $derived(l ? l.cards.filter((c) => !picked.includes(c.id)) : []);
  const full = $derived(!!l && picked.length === l.cards.length);

  function place(cid) {
    if (locked) return;
    pick = { round: l.round, ids: [...picked, cid] };
    sfx.pop();
    navigator.vibrate?.(15);
  }
  function unplace(cid) {
    if (locked) return;
    pick = { round: l.round, ids: picked.filter((x) => x !== cid) };
    sfx.bloop();
  }
  function lock() {
    if (!full || sentRound === l.round) return;
    sentRound = l.round;
    navigator.vibrate?.([40, 30, 80]);
    send('torder', { order: picked });
  }
  // Out of time: send whatever order is there, filling the rest in the order shown.
  $effect(() => {
    if (s.phase === 'tguess' && !locked && picked.length && l.until - now < 1200) {
      pick = { round: l.round, ids: [...picked, ...left.map((c) => c.id)] };
      lock();
    }
  });

  const res = $derived(l?.results?.[id]);
  const counted = $derived(l?.best?.[myUnit] === id);
</script>

{#if l}
  {#if s.phase === 'tguess'}
    {#if locked}
      <div class="stack center pop-in">
        <div class="bigemoji">🔒</div>
        <h2>Order locked in!</h2>
        <p class="muted">Waiting for the others… {secs(l.until)}</p>
        <ReactBar onReact={react} />
      </div>
    {:else}
      <div class="stack">
        <p class="qmini">📅 Round {l.round} of {l.rounds} · ⏱ {secs(l.until)}</p>
        <div class="slots">
          <span class="end">⏳ Oldest</span>
          {#each l.cards as _, i}
            {@const cid = picked[i]}
            {#if cid}
              <button class="slot filled pop-in" onclick={() => unplace(cid)}>
                <b>{i + 1}</b><span class="em">{card(cid).e}</span><span class="txt">{card(cid).t}</span><span class="x">✕</span>
              </button>
            {:else}
              <div class="slot empty"><b>{i + 1}</b><span class="muted">{i === picked.length ? 'Tap a card below' : ''}</span></div>
            {/if}
          {/each}
          <span class="end">🆕 Newest</span>
        </div>
        {#if left.length}
          <div class="pool">
            {#each left as c (c.id)}
              <button class="pcard" onclick={() => place(c.id)}><span class="em">{c.e}</span><span class="txt">{c.t}</span></button>
            {/each}
          </div>
        {:else}
          <button class="btn green big block pop-in" onclick={lock}>🔒 Lock my order</button>
        {/if}
      </div>
    {/if}

  {:else if s.phase === 'treveal' && l.answer}
    <div class="stack center pop-in">
      {#if res}
        <div class="bigemoji">{res.perfect ? '🏆' : res.right >= l.answer.length / 2 ? '👍' : '😬'}</div>
        <h2>{res.right} of {l.answer.length} in the right spot</h2>
        {#if counted}<p class="pts">+{res.pts}</p>{:else}<p class="muted">{res.pts >= (l.gained[myUnit] || 0) ? "Tied with a teammate, theirs counted." : "A teammate did better."}</p>{/if}
      {:else}
        <div class="bigemoji">⏰</div>
        <h2>No order this time</h2>
      {/if}
      <div class="mini">
        {#each l.answer as cid}<span><b>{l.years[cid]}</b> {card(cid).e}</span>{/each}
      </div>
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .qmini { margin: 0; }
  .slots { display: flex; flex-direction: column; gap: 0.35rem; }
  .end { font-size: 0.8rem; font-weight: 900; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .slot {
    display: flex; align-items: center; gap: 0.5rem; border-radius: 14px; padding: 0.4rem 0.6rem; min-height: 2.9rem; text-align: left;
  }
  .slot b { font-family: var(--font-display); font-weight: 400; font-size: 1.2rem; width: 1.2rem; text-align: center; }
  .slot.empty { background: var(--well); box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.25); font-size: 0.85rem; }
  .slot.filled { background: #eab308; color: #fff; box-shadow: 0 6px 14px -6px rgba(234, 179, 8, 0.8); }
  .slot .x { margin-left: auto; opacity: 0.8; }
  .txt { font-weight: 800; font-size: 0.92rem; line-height: 1.15; }
  .em { font-size: 1.5rem; }
  .pool { display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem; margin-top: 0.3rem; }
  .pcard {
    display: flex; flex-direction: column; align-items: center; gap: 0.2rem; text-align: center;
    background: var(--surface-hi); border-radius: 16px; padding: 0.55rem 0.4rem; box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.5);
    transition: transform 0.1s;
  }
  .pcard:active { transform: translateY(3px) scale(0.97); }
  .pcard .em { font-size: 1.9rem; }
  .pts { font-family: var(--font-display); font-size: 2.2rem; color: var(--green); margin: 0; }
  .mini { display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; }
  .mini span { background: var(--well); border-radius: 10px; padding: 0.2rem 0.5rem; }
</style>
