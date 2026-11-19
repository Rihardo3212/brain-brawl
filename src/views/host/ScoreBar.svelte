<script>
  import Avatar from '../../components/Avatar.svelte';
  import Pie from '../../components/Pie.svelte';

  let { s, avatars, here } = $props();
  const units = $derived(s.unitOrder.map((id) => ({ id, ...s.units[id] })));
  const cur = $derived(s.current);
  const unitHere = (u) => (u.members || []).some(here);
  const busy = (uid) => {
    if (s.phase === 'answer') return cur?.buzzUnit === uid;
    if (s.phase === 'board') return s.turn === uid;
    if (s.phase === 'ddraw' || s.phase === 'dchoose') return s.players[s.doodle?.drawer]?.unit === uid;
    return false;
  };
</script>

<footer class="scores">
  {#each units as u (u.id)}
    <div class="sc" class:busy={busy(u.id)} class:out={cur?.lockedOut?.[u.id] && (s.phase === 'question' || s.phase === 'answer')} style="--c:{u.color}">
      <Avatar src={avatars[u.id]} color={u.color} name={u.name} size={50} dim={!unitHere(u)} />
      <div>
        <div class="sname">{u.name}</div>
        <div class="spts" class:neg={u.score < 0}>{u.score}</div>
      </div>
      {#if (s.settings.sub || s.settings.game) === 'wedge'}<Pie wedges={u.wedges} size={40} />{/if}
    </div>
  {/each}
</footer>

<style>
  .scores { display: flex; justify-content: center; gap: 0.9rem; flex-wrap: wrap; padding: 0.7rem 1rem 1.2rem; position: relative; z-index: 2; }
  .sc {
    display: flex; align-items: center; gap: 0.7rem; color: #2b2240;
    background: #ffffff;
    box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.35), 0 10px 18px rgba(0, 0, 0, 0.25);
    /* Rounded rectangle whose corners follow the avatar's (30% of 50px + the padding), so the
       square avatar sits inside the card instead of poking out of a round pill. */
    border-radius: 22px; padding: 7px 1.2rem 10px 7px; transition: all 0.25s;
  }  .sc.busy { transform: translateY(-7px) scale(1.05); box-shadow: 0 0 0 4px var(--c), 0 0 26px var(--c), 0 6px 16px -6px rgba(0, 0, 0, 0.35); }
  .sc.out { opacity: 0.4; }
  .sname { font-weight: 800; font-size: 0.95rem; opacity: 0.7; }
  .spts { font-family: var(--font-display); font-size: 1.5rem; line-height: 1; }
  .spts.neg { color: var(--red); }
</style>
