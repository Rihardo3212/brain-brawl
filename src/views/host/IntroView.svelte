<script>
  import StepFlow from '../../components/StepFlow.svelte';
  import Timer from '../../components/Timer.svelte';
  import { MODES, lengthOf } from '../../lib/modes.js';
  import { INTRO_TIME } from '../../engine/core.js';

  let { s, now } = $props();
  const mode = $derived(MODES[s.settings.game]);
  const len = $derived(lengthOf(s.settings));
  const ctrl = $derived(s.mode === 'host' ? s.hostName : s.players[s.vip]?.name);
</script>

<section class="intro" style="--mc:{mode.color}">
  <div class="head pop-in">
    <span class="icon-tile" style="--sz:110px">{mode.icon}</span>
    <div>
      <p class="small">Up next</p>
      <h1>{mode.name}</h1>
      <span class="sticker tilt-r">{len.label} · {len.detail}</span>
    </div>
  </div>
  {#key s.game + s.settings.game}
    <StepFlow steps={mode.steps} color={mode.color} animate />
  {/key}
  <div class="foot">
    <Timer until={s.introUntil} total={INTRO_TIME} {now} />
    <p class="muted">Starting soon… {ctrl} can start right away from their phone.</p>
  </div>
</section>

<style>
  .intro { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2.4rem; padding: 1rem 3rem 2rem; max-width: 1300px; margin: 0 auto; width: 100%; }
  .head { display: flex; align-items: center; gap: 1.6rem; }
  .small { margin: 0; font-family: var(--font-display); font-size: 1.4rem; color: var(--muted); }
  h1 { font-size: 4.6rem; color: var(--mc); line-height: 1; margin: 0.1rem 0 0.6rem; }
  .head .sticker { font-size: 1.15rem; }
  .foot { width: 100%; max-width: 700px; display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
  .foot p { margin: 0; }
</style>
