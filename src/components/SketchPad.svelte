<script>
  // A drawing pad that keeps the drawing as strokes (same format as Doodle Dash),
  // so it can be sent once when done, shown on the big screen and compared.
  // Strokes: { c: color, w: width (on a 320px canvas), p: [x, y, x, y, ...] with x/y in 0..1000 }
  import { onMount } from 'svelte';
  import { drawStroke } from '../engine/util.js';

  const ALL = ['#2b2240', '#ff3b4f', '#ffb400', '#22c55e', '#2f8cff', '#a855f7', '#8b5a2b', '#ffffff'];
  let { colors = ALL, frame = '#ffc400', onChange = () => {}, onDone = null, doneLabel = 'Done!', disabled = false } = $props();

  const SIZE = 320;
  let canvas;
  let ctx;
  // svelte-ignore state_referenced_locally
  let pen = $state(colors[0]);
  let width = $state(10);
  let strokes = $state([]);
  let cur = null;

  onMount(() => {
    ctx = canvas.getContext('2d');
    redraw();
  });

  function redraw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (const st of strokes) drawStroke(ctx, st, SIZE);
  }
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 1000);
    const y = Math.round(((e.clientY - r.top) / r.height) * 1000);
    return [Math.max(0, Math.min(1000, x)), Math.max(0, Math.min(1000, y))];
  }
  function down(e) {
    if (disabled) return;
    canvas.setPointerCapture(e.pointerId);
    cur = { c: pen, w: width, p: pos(e) };
    drawStroke(ctx, cur, SIZE);
  }
  function move(e) {
    if (!cur) return;
    const [x, y] = pos(e);
    const n = cur.p.length;
    // Skip points that barely moved: keeps the drawing small to send.
    if (Math.hypot(x - cur.p[n - 2], y - cur.p[n - 1]) < 7) return;
    drawStroke(ctx, { ...cur, p: [cur.p[n - 2], cur.p[n - 1], x, y] }, SIZE);
    cur.p.push(x, y);
  }
  function up() {
    if (!cur) return;
    strokes = [...strokes, cur];
    cur = null;
    onChange($state.snapshot(strokes));
  }
  function undo() {
    strokes = strokes.slice(0, -1);
    redraw();
    onChange($state.snapshot(strokes));
  }
  function clear() {
    strokes = [];
    redraw();
    onChange([]);
  }
</script>

<div class="sp">
  <div class="frame" style="--c:{frame}">
    <canvas
      bind:this={canvas}
      data-nofit
      width={SIZE}
      height={SIZE}
      onpointerdown={down}
      onpointermove={move}
      onpointerup={up}
      onpointercancel={up}
    ></canvas>
  </div>
  {#if colors.length > 1}
    <div class="colors card">
      {#each colors as c}
        <button class="swatch" class:on={pen === c} style="background:{c}" aria-label="color {c}" onclick={() => (pen = c)}></button>
      {/each}
    </div>
  {/if}
  <div class="tools">
    {#each [5, 10, 20] as w}
      <button class="icon-btn" class:on={width === w} onclick={() => (width = w)} aria-label="brush {w}">
        <span class="dot" style="width:{w}px;height:{w}px"></span>
      </button>
    {/each}
    <button class="btn ghost small" disabled={!strokes.length || disabled} onclick={undo}>↩ Undo</button>
    <button class="btn ghost small" disabled={!strokes.length || disabled} onclick={clear}>🧽</button>
  </div>
  {#if onDone}
    <button class="btn green big block" disabled={!strokes.length || disabled} onclick={() => onDone($state.snapshot(strokes))}>{doneLabel}</button>
  {/if}
</div>

<style>
  .sp { display: flex; flex-direction: column; gap: 0.6rem; align-items: center; width: 100%; }
  .frame {
    padding: 8px; border-radius: 30px; background: var(--c);
    box-shadow: 0 8px 20px -6px color-mix(in srgb, var(--c) 70%, transparent), 0 14px 26px rgba(0, 0, 0, 0.3);
  }
  canvas {
    display: block; width: min(80vw, 330px, calc(100dvh - 380px)); min-width: 200px; aspect-ratio: 1; background: #fff;
    border-radius: 22px; touch-action: none; box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  .colors { display: flex; gap: 0.45rem; flex-wrap: wrap; justify-content: center; padding: 0.5rem 0.8rem; border-radius: 999px; }
  .swatch { width: min(30px, 7vw); height: min(30px, 7vw); border-radius: 50%; border: 3px solid rgba(255, 255, 255, 0.7); box-shadow: 0 3px 0 rgba(0, 0, 0, 0.3); transition: transform 0.1s; }
  .swatch.on { transform: scale(1.22) translateY(-2px); box-shadow: 0 0 0 3px var(--ring), 0 4px 0 rgba(0, 0, 0, 0.3); }
  .tools { display: flex; gap: 0.45rem; align-items: center; }
  .icon-btn.on { box-shadow: 0 0 0 3px var(--ring), 0 6px 16px -6px rgba(0, 0, 0, 0.5); }
  .dot { background: var(--ink); border-radius: 50%; display: block; }
  .block { width: 100%; }
</style>
