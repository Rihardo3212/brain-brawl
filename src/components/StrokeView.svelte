<script>
  // Shows a drawing made of strokes. ghost: optional strokes drawn faintly underneath
  // (Memory Sketch puts the original shape under each player's drawing).
  import { drawStroke } from '../engine/util.js';

  let { strokes = [], ghost = null, color = null, size = 240, border = '#fff' } = $props();
  const RES = 320;
  let canvas = $state();

  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, RES, RES);
    if (ghost) {
      ctx.globalAlpha = 0.28;
      for (const st of ghost) drawStroke(ctx, { ...st, c: '#22c55e', w: (st.w || 10) + 6 }, RES);
      ctx.globalAlpha = 1;
    }
    for (const st of strokes || []) drawStroke(ctx, color ? { ...st, c: color } : st, RES);
  });
</script>

<canvas bind:this={canvas} width={RES} height={RES} style="width:{size}px; --b:{border}"></canvas>

<style>
  canvas { display: block; aspect-ratio: 1; border-radius: 18px; background: #fff; border: 5px solid var(--b); box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35); }
</style>
