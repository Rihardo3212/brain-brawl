<script>
  // The Wedge Rush spinner. Spins a few turns and lands on the chosen wedge.
  import { onMount } from 'svelte';
  import { WEDGES } from '../content/wedges.js';
  import { sfx } from '../lib/sound.js';

  let { target = 0, turns = 3, duration = 3800, size = 420, done = false } = $props();
  let angle = $state(0);
  let wheel;

  function slice(i) {
    const R = 50;
    const a0 = ((i * 60 - 90) * Math.PI) / 180;
    const a1 = (((i + 1) * 60 - 90) * Math.PI) / 180;
    return `M50 50 L${50 + R * Math.cos(a0)} ${50 + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${50 + R * Math.cos(a1)} ${50 + R * Math.sin(a1)} Z`;
  }
  function labelPos(i) {
    const a = ((i * 60 + 30 - 90) * Math.PI) / 180;
    return { x: 50 + 32 * Math.cos(a), y: 50 + 32 * Math.sin(a), rot: i * 60 + 30 };
  }

  onMount(() => {
    if (done) { angle = 360 - (target * 60 + 30); return; }
    const final = turns * 360 + (360 - (target * 60 + 30));
    requestAnimationFrame(() => requestAnimationFrame(() => (angle = final)));
    // clicking sound that slows down like a real wheel
    let t = 0;
    const clicks = turns * 6 + target + 1;
    for (let k = 0; k < clicks; k++) {
      const p = k / clicks;
      t = duration * (1 - Math.pow(1 - p, 0.45)) * 0.97;
      setTimeout(() => sfx.tick(), t);
    }
  });
</script>

<div class="wrap" style="--sz:{size}px">
  <div class="pointer">▼</div>
  <svg bind:this={wheel} class="wheel" viewBox="-4 -4 108 108" style="transform:rotate({angle}deg); transition: transform {done ? 0 : duration}ms cubic-bezier(0.12, 0.7, 0.12, 1)">
    <circle cx="50" cy="50" r="53" fill="#2b2240" />
    {#each WEDGES as w, i}
      {@const l = labelPos(i)}
      <path d={slice(i)} fill={w.color} stroke="#fff" stroke-width="1.6" />
      <text x={l.x} y={l.y} font-size="11" text-anchor="middle" dominant-baseline="middle" transform="rotate({l.rot} {l.x} {l.y})">{w.icon}</text>
    {/each}
    <circle cx="50" cy="50" r="12" fill="#fff" stroke="#2b2240" stroke-width="2" />
    <text x="50" y="51" font-size="10" text-anchor="middle" dominant-baseline="middle">⚡</text>
  </svg>
</div>

<style>
  .wrap { position: relative; width: var(--sz); height: var(--sz); }
  .wheel {
    width: 100%; height: 100%;
    filter: drop-shadow(0 10px 0 rgba(0, 0, 0, 0.35)) drop-shadow(0 18px 30px rgba(0, 0, 0, 0.4));
  }
  .pointer {
    position: absolute; left: 50%; top: -28px; transform: translateX(-50%);
    font-size: 54px; color: #fff; z-index: 2;
    text-shadow: 0 4px 0 #2b2240, 0 8px 10px rgba(0, 0, 0, 0.4);
    animation: nudge 0.25s ease-in-out infinite alternate;
  }
  @keyframes nudge { to { transform: translateX(-50%) translateY(4px); } }
</style>
