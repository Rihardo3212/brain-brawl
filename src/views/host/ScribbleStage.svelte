<script>
  import { onDestroy } from 'svelte';
  import Avatar from '../../components/Avatar.svelte';
  import Timer from '../../components/Timer.svelte';
  import StrokeView from '../../components/StrokeView.svelte';
  import { T, POINTS, kindOf, key, authorOf } from '../../engine/scribble.js';

  let { s, avatars, now, db } = $props();

  const c = $derived(s.chain);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const P = (pid) => ({ id: pid, ...s.players[pid] });
  const colorOf = (p) => (s.teamMode ? s.units[p.unit]?.color : p.color) || p.color;
  const making = $derived(['scwrite', 'scdraw', 'scdesc'].includes(s.phase));
  const kind = $derived(c ? kindOf(c.step) : 'write');
  const LABEL = { write: '✍️ Write a silly prompt!', draw: '🎨 Draw what you got!', desc: '🤔 What is this drawing?' };

  let drawings = $state({});
  let unsub = null;
  let watching = null;
  $effect(() => {
    const path = c && !making ? `rooms/${s.code}/${c.path}` : null;
    if (path === watching) return;
    unsub?.();
    unsub = null;
    watching = path;
    if (path) unsub = db.onValue(path, (v) => (drawings = v || {}));
  });
  onDestroy(() => unsub?.());

  const steps = $derived(
    c && !making
      ? Array.from({ length: c.len }, (_, k) => ({
          k,
          kind: kindOf(k),
          by: P(authorOf(c, c.showIdx, k)),
          text: c.texts[key(c.showIdx, k)],
          strokes: drawings[key(c.showIdx, k)]
        }))
      : []
  );
  const shown = $derived(steps.filter((st) => s.phase === 'scvote' || st.k <= c.showStep));
  const votesFor = (k) => Object.keys(c.votes).filter((v) => c.votes[v] === k);
  const size = $derived(c ? Math.min(230, Math.floor(1200 / c.len) - 30) : 200);
</script>

{#if c}
  <section class="main">
    <div class="qhead">
      <span class="chip" style="--c:#a855f7; --cd:#7e22ce">🔗 Scribble Chain</span>
      {#if c.rounds > 1}<span class="chip sun">Round {c.round} of {c.rounds}</span>{/if}
      {#if making}<span class="chip">Step {c.step + 1} of {c.len}</span>{:else}<span class="chip">Chain {c.showIdx + 1} of {c.order.length}</span>{/if}
    </div>

    {#if making}
      <div class="sticker big tilt-r pop-in">{LABEL[kind]}</div>
      <p class="hint">
        {#if kind === 'write'}Something fun to draw. Your phone has a 🎲 button if you're stuck.
        {:else if kind === 'draw'}Draw the words on your phone. No letters allowed!
        {:else}Describe the drawing on your phone in a few words.{/if}
      </p>
      <div class="locks">
        {#each c.order.map(P) as p (p.id)}
          <div class="lock" class:on={!!c.done[p.id]}>
            <Avatar src={avatars[p.id]} color={colorOf(p)} name={p.name} size={60} />
            <span>{c.done[p.id] ? '✅' : kind === 'draw' ? '🎨' : '✍️'}</span>
          </div>
        {/each}
      </div>
      <div class="tw"><Timer until={c.until} total={T[kind]} {now} /><span class="secs-big">{secs(c.until)}</span></div>
    {:else}
      <div class="sticker big tilt-r">
        {#if s.phase === 'scshow'}📜 {P(c.order[c.showIdx]).name}'s chain{:else if c.tallied}⭐ The votes are in!{:else}⭐ Vote for your favorite step!{/if}
      </div>
      <div class="chain">
        {#each shown as st, n (st.k)}
          {#if n > 0}<span class="arrow">➜</span>{/if}
          <div class="step pop-in" class:fresh={s.phase === 'scshow' && st.k === c.showStep}>
            {#if st.kind === 'draw'}
              {#if st.strokes}<StrokeView strokes={st.strokes} {size} border={colorOf(st.by)} />
              {:else}<div class="empty" style="width:{size}px; height:{size}px">🫥 No drawing</div>{/if}
            {:else}
              <div class="say" class:first={st.k === 0} style="width:{size}px">“{st.text || '🤷'}”</div>
            {/if}
            <span class="by"><Avatar src={avatars[st.by.id]} color={colorOf(st.by)} name={st.by.name} size={30} /> {st.by.name}</span>
            {#if s.phase === 'scvote' && c.tallied}
              <span class="votes">
                {#each votesFor(st.k) as v (v)}<Avatar src={avatars[v]} color={colorOf(P(v))} name={s.players[v]?.name} size={22} />{/each}
              </span>
              {#if votesFor(st.k).length}<span class="pill ok">+{votesFor(st.k).length * POINTS.vote}</span>{/if}
            {/if}
          </div>
        {/each}
      </div>
      {#if s.phase === 'scvote' && !c.tallied}
        <div class="tw"><Timer until={c.until} total={T.vote} {now} /><span class="secs-big">{secs(c.until)}</span></div>
      {/if}
    {/if}
  </section>
{/if}

<style>
  .main {
    flex: 1; display: flex; flex-direction: column; gap: 1.1rem; align-items: center; justify-content: center;
    padding: 0.3rem 2rem 1rem; max-width: 1500px; width: 100%; margin: 0 auto; position: relative; z-index: 1;
  }
  .qhead { display: flex; gap: 0.7rem; font-size: 1.45rem; }
  .sticker.big { font-size: 1.8rem; }
  .hint { margin: 0; font-size: 1.3rem; opacity: 0.85; text-align: center; }
  .locks { display: flex; gap: 1.1rem; flex-wrap: wrap; justify-content: center; }
  .lock { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; opacity: 0.5; transition: all 0.2s; }
  .lock.on { opacity: 1; transform: translateY(-4px); }
  .chain { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; }
  .arrow { font-size: 1.8rem; opacity: 0.6; }
  .step { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; transition: transform 0.3s; }
  .step.fresh { transform: scale(1.06); }
  .say {
    font-family: var(--font-display); font-size: 1.5rem; line-height: 1.2; text-align: center; word-break: break-word;
    background: #fff; color: #2b2240; border-radius: 20px; padding: 0.9rem 0.8rem; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
  }
  .say.first { background: #a855f7; color: #fff; }
  .empty { display: grid; place-items: center; border-radius: 18px; background: var(--surface-hi); font-weight: 900; }
  .by { display: flex; align-items: center; gap: 0.35rem; font-weight: 900; }
  .votes { display: flex; gap: 0.15rem; min-height: 22px; flex-wrap: wrap; justify-content: center; max-width: 200px; }
  .pill.ok { background: var(--green); color: #fff; }
  .tw { width: 100%; max-width: 640px; display: flex; align-items: center; gap: 1rem; }
  .secs-big { font-family: var(--font-display); font-size: 1.8rem; min-width: 2.5rem; }
</style>
