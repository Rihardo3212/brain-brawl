<script>
  import Avatar from '../../components/Avatar.svelte';
  import { GAMES, formatResult } from '../../engine/reflex.js';

  let { s, avatars, now } = $props();

  const r = $derived(s.reflex);
  const game = $derived(r ? GAMES[r.game] : null);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const players = $derived(s.order.filter((pid) => s.players[pid]?.unit).map((pid) => ({ id: pid, ...s.players[pid] })));
  const colorOf = (p) => (s.teamMode ? s.units[p.unit]?.color : p.color) || p.color;

  const rows = $derived(
    r && s.phase === 'rresult'
      ? players
          .filter((p) => r.results[p.id])
          .map((p) => ({ ...p, res: r.results[p.id], pts: r.points[p.id] || 0, best: r.best[p.unit] === p.id }))
          .sort((a, b) => b.pts - a.pts)
      : []
  );
</script>

{#if r && game}
  <section class="main">
    <div class="qhead">
      <span class="chip" style="--c:#f97316; --cd:#c2410c">⚡ Reflex Rumble</span>
      <span class="chip sun">Game {r.round} of {r.rounds}</span>
    </div>

    {#if s.phase === 'rready'}
      {#key r.round}
        <div class="intro pop-in">
          <span class="icon-tile" style="--sz:150px; --mc:#f97316">{game.icon}</span>
          <h1>{game.name}</h1>
          <p class="how">{game.how}</p>
          <div class="count">{secs(r.readyUntil)}</div>
        </div>
      {/key}

    {:else if s.phase === 'rgo'}
      <div class="go pop-in">
        <span class="big">{r.game === 'green' ? '👀' : r.game === 'stop5' ? '⏱️' : 'GO!'}</span>
        <p class="how">{r.game === 'green' ? 'Watch your phone… wait for green!' : r.game === 'stop5' ? 'Count in your head…' : game.how}</p>
      </div>
      <div class="locks">
        {#each players as p (p.id)}
          <div class="lock" class:on={!!r.results[p.id]}>
            <Avatar src={avatars[p.id]} color={colorOf(p)} name={p.name} size={54} />
            <span>{r.results[p.id] ? (r.results[p.id].foul ? '🚫' : '✅') : '⚡'}</span>
          </div>
        {/each}
      </div>

    {:else if s.phase === 'rresult'}
      <h2 class="rtitle">{game.icon} {game.name}</h2>
      <div class="results">
        {#each rows as row, i (row.id)}
          <div class="res slide-up" class:faded={!row.best} style="animation-delay:{i * 220}ms; --c:{colorOf(row)}">
            <span class="rank">{row.pts ? i + 1 : '–'}</span>
            <Avatar src={avatars[row.id]} color={colorOf(row)} name={row.name} size={42} />
            <span class="rn">{row.name}</span>
            <span class="rv">{formatResult(r.game, row.res)}</span>
            <span class="rp">{row.best && row.pts ? `+${row.pts}` : ''}</span>
          </div>
        {:else}
          <p class="nobody">Nobody played! Wake up! 😴</p>
        {/each}
      </div>
    {/if}
  </section>
{/if}

<style>
  .main {
    flex: 1; display: flex; flex-direction: column; gap: 1.2rem; align-items: center; justify-content: center;
    padding: 0.3rem 2.5rem 1rem; max-width: 1300px; width: 100%; margin: 0 auto; position: relative; z-index: 1;
  }
  .qhead { display: flex; gap: 0.7rem; font-size: 1.45rem; }
  .intro, .go { display: flex; flex-direction: column; align-items: center; gap: 0.8rem; text-align: center; }
  h1 { font-size: 4.2rem; margin: 0; }
  .how { font-size: 1.8rem; font-weight: 900; margin: 0; max-width: 900px; }
  .count { font-family: var(--font-display); font-size: 6rem; line-height: 1; color: #f97316; text-shadow: 0 8px 0 rgba(0, 0, 0, 0.25); }
  .big { font-family: var(--font-display); font-size: 10rem; line-height: 1; color: #f97316; text-shadow: 0 10px 0 rgba(0, 0, 0, 0.3); animation: pulse 0.6s ease-in-out infinite alternate; }
  @keyframes pulse { to { transform: scale(1.1); } }
  .locks { display: flex; gap: 1.1rem; flex-wrap: wrap; justify-content: center; }
  .lock { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; opacity: 0.5; transition: all 0.2s; }
  .lock.on { opacity: 1; transform: translateY(-4px); }
  .rtitle { font-size: 2.6rem; margin: 0; }
  .results { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; max-width: 760px; }
  .res {
    display: flex; align-items: center; gap: 0.7rem; background: #fff; color: #2b2240; border-radius: 18px; padding: 0.4rem 0.9rem;
    font-weight: 900; font-size: 1.3rem; animation-fill-mode: both;
  }
  .res.faded { opacity: 0.6; }
  .rank { font-family: var(--font-display); width: 1.8rem; text-align: center; color: var(--c); font-size: 1.7rem; }
  .rn { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rv { color: #5b5270; }
  .rp { font-family: var(--font-display); color: var(--green-dark); min-width: 4rem; text-align: right; font-size: 1.5rem; }
  .nobody { font-size: 1.6rem; text-align: center; }
</style>
