<script>
  import { REACTIONS } from '../lib/room.js';
  let { onReact } = $props();
  let last = 0;
  let bumped = $state(null);
  function tap(e) {
    const t = Date.now();
    if (t - last < 350) return;
    last = t;
    bumped = e;
    setTimeout(() => (bumped = null), 200);
    navigator.vibrate?.(15);
    onReact(e);
  }
</script>

<div class="bar">
  {#each REACTIONS as e}
    <button class:bump={bumped === e} onclick={() => tap(e)} aria-label="react {e}">{e}</button>
  {/each}
</div>

<style>
  .bar {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;
    background: var(--surface-hi); border-radius: 24px; padding: 0.55rem;
    box-shadow: var(--shadow); width: 100%;
  }
  button {
    font-size: 1.75rem; height: 54px; border-radius: 18px;
    background: var(--surface-hi);
    box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.5);
    transition: transform 0.12s;
  }
  button:active, .bump { transform: translateY(3px) scale(1.18) rotate(-8deg); box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.5); }
</style>
