<script>
  import Avatar from '../../components/Avatar.svelte';
  import LiveCanvas from '../../components/LiveCanvas.svelte';
  import Timer from '../../components/Timer.svelte';
  import { TEAM_DRAW_TIME } from '../../engine/core.js';

  let { s, avatars, db, now } = $props();
  const units = $derived(s.unitOrder.map((id) => ({ id, ...s.units[id] })));
</script>

<section class="main">
  <h1 class="title bounce">Draw your team picture!</h1>
  <div class="tw"><Timer until={s.drawUntil} total={TEAM_DRAW_TIME} {now} /></div>
  <div class="grid" style="--n:{units.length}">
    {#each units as u (u.id)}
      <div class="panel card pop-in">
        <h2 style="color:{u.color}">{u.emoji} {u.name} {#if s.teamReady[u.id]}<span class="done">✓</span>{/if}</h2>
        {#key s.game}
          <LiveCanvas {db} path={`rooms/${s.code}/teamdraw/${u.team}`} color={u.color} readOnly />
        {/key}
        <div class="members">
          {#each u.members as m}<Avatar src={avatars[m]} color={s.players[m]?.color} name={s.players[m]?.name} size={42} />{/each}
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .main { flex: 1; display: flex; flex-direction: column; gap: 1rem; align-items: center; padding: 0.3rem 2.5rem 1.5rem; width: 100%; max-width: 1400px; margin: 0 auto; }
  .title { font-size: 3.2rem; color: var(--sun); text-shadow: 0 8px 20px -6px color-mix(in srgb, var(--sun) 70%, transparent), 0 8px 14px rgba(0, 0, 0, 0.3); }
  .tw { width: 100%; max-width: 700px; }
  .grid { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 1.2rem; width: 100%; }
  .panel { display: flex; flex-direction: column; align-items: center; gap: 0.7rem; }
  .panel h2 { font-size: 1.5rem; text-align: center; text-shadow: 0 2px 0 rgba(0, 0, 0, 0.2); }
  .done { color: var(--green); }
  .members { display: flex; gap: 0.35rem; flex-wrap: wrap; justify-content: center; }
</style>
