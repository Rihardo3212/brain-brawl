<script>
  // A unit's wedge collection: six slices, filled in the wedge color once won.
  import { WEDGES } from '../content/wedges.js';
  let { wedges = {}, size = 48, glow = null } = $props();
  const R = 50;
  function slice(i) {
    const a0 = ((i * 60 - 90) * Math.PI) / 180;
    const a1 = (((i + 1) * 60 - 90) * Math.PI) / 180;
    const x0 = 50 + R * Math.cos(a0), y0 = 50 + R * Math.sin(a0);
    const x1 = 50 + R * Math.cos(a1), y1 = 50 + R * Math.sin(a1);
    return `M50 50 L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`;
  }
</script>

<svg class="pie" viewBox="-6 -6 112 118" width={size} height={size * 1.05} aria-label="{Object.keys(wedges).length} wedges">
  <circle cx="50" cy="56" r="52" fill="rgba(0,0,0,0.35)" />
  <circle cx="50" cy="50" r="53" fill="#fff" />
  {#each WEDGES as w, i}
    <path d={slice(i)} fill={wedges[w.id] ? w.color : '#d9d3e6'} stroke="#fff" stroke-width="3" class:new={glow === w.id} />
  {/each}
  <circle cx="50" cy="50" r="9" fill="#fff" />
  <ellipse cx="38" cy="26" rx="22" ry="9" fill="rgba(255,255,255,0.35)" />
</svg>

<style>
  .pie { display: block; overflow: visible; }
  .new { animation: flash 0.5s ease-in-out 4 alternate; transform-origin: 50px 50px; }
  @keyframes flash { to { transform: scale(1.12); filter: brightness(1.3); } }
</style>
