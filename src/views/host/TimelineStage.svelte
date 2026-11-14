<script>
  import Avatar from '../../components/Avatar.svelte';
  import Timer from '../../components/Timer.svelte';

  let { s, avatars, now } = $props();

  const l = $derived(s.line);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const players = $derived(s.order.filter((pid) => s.players[pid]?.unit).map((pid) => ({ id: pid, ...s.players[pid] })));
  const colorOf = (p) => (s.teamMode ? s.units[p.unit]?.color : p.color) || p.color;
  const card = (id) => l.cards.find((c) => c.id === id);
  const STEP = 550; // ms between cards landing on the timeline

  const rows = $derived(
    l && s.phase === 'treveal'
      ? players
          .filter((p) => l.orders[p.id])
          .map((p) => ({ ...p, ...l.results[p.id], order: l.orders[p.id], best: l.best[p.unit] === p.id }))
          .sort((a, b) => b.pts - a.pts)
      : []
  );
  const marks = (order) => order.map((id, i) => id === l.answer[i] || l.years[id] === l.years[l.answer[i]]);
</script>

{#if l}
  <section class="main">
    <div class="qhead">
      <span class="chip" style="--c:#eab308; --cd:#a16207">📅 Timeline</span>
      <span class="chip sun">Round {l.round} of {l.rounds}</span>
      {#if l.size > 4}<span class="chip" style="--c:var(--red); --cd:var(--red-dark)">🔥 5 cards!</span>{/if}
    </div>

    {#if s.phase === 'tguess'}
      <div class="sticker big tilt-r">Put them in order: <b>oldest ➜ newest</b></div>
      {#key l.round}
        <div class="cards">
          {#each l.cards as c, i (c.id)}
            <div class="ecard pop-in" style="animation-delay:{i * 120}ms; --tilt:{(i % 2 ? 1 : -1) * (1 + (i % 3))}deg">
              <span class="em">{c.e}</span>
              <span class="et">{c.t}</span>
            </div>
          {/each}
        </div>
      {/key}
      <div class="locks">
        {#each players as p (p.id)}
          <div class="lock" class:on={!!l.orders[p.id]}>
            <Avatar src={avatars[p.id]} color={colorOf(p)} name={p.name} size={50} />
            <span>{l.orders[p.id] ? '🔒' : '🤔'}</span>
          </div>
        {/each}
      </div>
      <div class="tw">
        <Timer until={l.until} total={l.until - l.startAt} {now} /><span class="secs-big">{secs(l.until)}</span>
      </div>

    {:else if s.phase === 'treveal' && l.answer}
      <div class="line">
        <div class="track"></div>
        {#each l.answer as id, i (id)}
          {@const c = card(id)}
          <div class="slot slide-up" style="animation-delay:{300 + i * STEP}ms">
            <span class="year">{l.years[id]}</span>
            <span class="dot"></span>
            <div class="ecard small">
              <span class="em">{c.e}</span>
              <span class="et">{c.t}</span>
            </div>
          </div>
        {/each}
      </div>

      <div class="results">
        {#each rows as r, i (r.id)}
          <div class="res slide-up" class:faded={!r.best} style="animation-delay:{800 + l.answer.length * STEP + i * 180}ms; --c:{colorOf(r)}">
            <Avatar src={avatars[r.id]} color={colorOf(r)} name={r.name} size={36} />
            <span class="rn">{r.name}</span>
            <span class="ticks">{#each marks(r.order) as ok}<i class:ok>{ok ? '✓' : '✗'}</i>{/each}</span>
            <span class="rp">{r.best ? `+${r.pts}` : ''}</span>
          </div>
        {:else}
          <p class="nobody">Nobody sorted the cards in time!</p>
        {/each}
      </div>
    {/if}
  </section>
{/if}

<style>
  .main {
    flex: 1; display: flex; flex-direction: column; gap: 1.1rem; align-items: center; justify-content: center;
    padding: 0.3rem 2.5rem 1rem; max-width: 1500px; width: 100%; margin: 0 auto; position: relative; z-index: 1;
  }
  .qhead { display: flex; gap: 0.7rem; font-size: 1.45rem; }
  .sticker.big { font-size: 1.7rem; }
  .sticker b { color: #a16207; }
  .cards { display: flex; gap: 1.1rem; flex-wrap: wrap; justify-content: center; }
  .ecard {
    width: 220px; min-height: 200px; background: #fff; color: #2b2240; border-radius: 24px; padding: 1rem 0.9rem;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; text-align: center;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45); transform: rotate(var(--tilt, 0deg));
  }
  .em { font-size: 3.4rem; line-height: 1; filter: drop-shadow(0 4px 0 rgba(0, 0, 0, 0.15)); }
  .et { font-weight: 900; font-size: 1.2rem; line-height: 1.2; }
  .locks { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
  .lock { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; opacity: 0.5; transition: all 0.2s; }
  .lock.on { opacity: 1; transform: translateY(-4px); }
  .tw { width: 100%; max-width: 640px; display: flex; align-items: center; gap: 1rem; }
  .secs-big { font-family: var(--font-display); font-size: 1.8rem; min-width: 2.5rem; }

  /* the timeline */
  .line { position: relative; display: flex; gap: 1rem; justify-content: center; width: 100%; padding-top: 0.4rem; }
  .track { position: absolute; left: 4%; right: 4%; top: 3.15rem; height: 10px; border-radius: 99px; background: rgba(255, 255, 255, 0.35); }
  .slot { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; position: relative; animation-fill-mode: both; }
  .year {
    font-family: var(--font-display); font-size: 1.9rem; background: #eab308; color: #fff; border-radius: 16px;
    padding: 0 0.8rem 0.1rem; box-shadow: 0 8px 20px -6px rgba(234, 179, 8, 0.8);
  }
  .dot { width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 5px solid #eab308; }
  .ecard.small { width: 200px; min-height: 150px; transform: none; padding: 0.8rem; }
  .ecard.small .em { font-size: 2.6rem; }
  .ecard.small .et { font-size: 1.05rem; }

  .results { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0.45rem; width: 100%; max-width: 1150px; }
  .res {
    display: flex; align-items: center; gap: 0.5rem; background: #fff; color: #2b2240; border-radius: 14px; padding: 0.3rem 0.7rem;
    font-weight: 900; animation-fill-mode: both;
  }
  .res.faded { opacity: 0.55; }
  .rn { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ticks { display: flex; gap: 0.15rem; }
  .ticks i { font-style: normal; width: 1.4rem; height: 1.4rem; border-radius: 50%; display: grid; place-items: center; font-size: 0.85rem; background: var(--red); color: #fff; }
  .ticks i.ok { background: var(--green); }
  .rp { font-family: var(--font-display); color: var(--green-dark); min-width: 3.4rem; text-align: right; font-size: 1.2rem; }
  .nobody { font-size: 1.4rem; text-align: center; grid-column: 1 / -1; }
</style>
