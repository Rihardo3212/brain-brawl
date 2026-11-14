<script>
  import Logo from '../components/Logo.svelte';
  import StepFlow from '../components/StepFlow.svelte';
  import { DEVELOPER } from '../lib/brand.js';
  import { MODES, GROUP_LIST, modesIn, SETUP_STEPS, EXTRAS } from '../lib/modes.js';
</script>

<main>
  <a href="#/" class="back"><Logo size={0.7} /></a>
  <h1>How to play</h1>

  <section class="block">
    <h2>Get set up</h2>
    <StepFlow steps={SETUP_STEPS} color="var(--red)" />
    <div class="extras">
      {#each EXTRAS as x}
        <span class="extra pill"><span class="icon-tile" style="--sz:36px; --mc:var(--surface-2)">{x.icon}</span>{x.label}</span>
      {/each}
    </div>
  </section>

  {#each GROUP_LIST.flatMap((g) => modesIn(g.id).map((id, i) => ({ id, g: i === 0 ? g : null }))) as { id, g }}
    {@const m = MODES[id]}
    {#if g}<h2 class="ghead">{g.icon} {g.label}</h2>{/if}
    <section class="block" style="--mc:{m.color}">
      <div class="mhead">
        <span class="icon-tile" style="--sz:60px">{m.icon}</span>
        <h2 style="color:{m.color}">{m.name}</h2>
        {#if m.min > 1}<span class="sticker tilt-r">{m.min}+ players</span>{/if}
      </div>
      <StepFlow steps={m.steps} color={m.color} />
    </section>
  {/each}

  <a class="btn big" href="#/">Let's play</a>
  <footer class="footer">a {DEVELOPER} game</footer>
</main>

<style>
  main { max-width: 1100px; margin: 0 auto; padding: 2rem 1.2rem; display: flex; flex-direction: column; align-items: center; gap: 1.6rem; }
  .back { text-decoration: none; }
  .ghead { font-size: 2.6rem; margin-top: 1rem; }
  h1 { font-size: 3rem; }
  .block { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 1.3rem; padding-top: 0.6rem; }
  .block h2 { font-size: 2.2rem; }
  .mhead { display: flex; align-items: center; gap: 0.9rem; }
  .extras { display: flex; flex-wrap: wrap; gap: 0.7rem; justify-content: center; }
  .extra { padding: 0.3rem 1rem 0.3rem 0.35rem; gap: 0.6rem; font-size: 1.05rem; }
  .extra .icon-tile { transform: none; box-shadow: none; }
</style>
