<script>
  import { onMount } from 'svelte';
  let { color = '#5b2bd6', onDone, title = 'Draw yourself!' } = $props();

  const COLORS = ['#2b2240', '#ff3b4f', '#ffb400', '#22c55e', '#2f8cff', '#a855f7', '#8b5a2b', '#ffffff'];
  const SIZE = 320; // internal canvas resolution

  let canvas;
  let ctx;
  let pen = $state(COLORS[0]);
  let width = $state(10);
  let drawing = false;
  let last = null;
  let history = [];
  let empty = $state(true);

  onMount(() => {
    ctx = canvas.getContext('2d');
    clear();
  });

  function clear() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, SIZE, SIZE);
    history = [];
    empty = true;
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
  }

  function down(e) {
    canvas.setPointerCapture(e.pointerId);
    history.push(ctx.getImageData(0, 0, SIZE, SIZE));
    if (history.length > 20) history.shift();
    drawing = true;
    last = pos(e);
    dot(last);
  }
  function move(e) {
    if (!drawing) return;
    const p = pos(e);
    ctx.strokeStyle = pen;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
    empty = false;
  }
  function up() { drawing = false; }

  function dot(p) {
    ctx.fillStyle = pen;
    ctx.beginPath();
    ctx.arc(p.x, p.y, width / 2, 0, Math.PI * 2);
    ctx.fill();
    empty = false;
  }

  function undo() {
    const img = history.pop();
    if (img) ctx.putImageData(img, 0, 0);
  }

  function done() {
    // Export a smaller image so it is quick to send.
    const out = document.createElement('canvas');
    out.width = out.height = 160;
    out.getContext('2d').drawImage(canvas, 0, 0, 160, 160);
    onDone(out.toDataURL('image/png'));
  }
</script>

<div class="pad">
  <h2 class="on-bg">{title}</h2>
  <div class="frame" style="--c:{color}">
    <canvas
      bind:this={canvas}
      width={SIZE}
      height={SIZE}
      onpointerdown={down}
      onpointermove={move}
      onpointerup={up}
      onpointercancel={up}
    ></canvas>
  </div>

  <div class="colors card">
    {#each COLORS as c}
      <button class="swatch" class:on={pen === c} style="background:{c}" aria-label="color {c}" onclick={() => (pen = c)}></button>
    {/each}
  </div>

  <div class="tools">
    {#each [5, 10, 20] as w}
      <button class="icon-btn" class:on={width === w} onclick={() => (width = w)} aria-label="brush {w}">
        <span class="dot" style="width:{w}px;height:{w}px"></span>
      </button>
    {/each}
    <button class="btn ghost small" onclick={undo}>↩ Undo</button>
    <button class="btn ghost small" onclick={clear}>🧽</button>
  </div>

  <button class="btn green big block" disabled={empty} onclick={done}>Done!</button>
</div>

<style>
  .pad { display: flex; flex-direction: column; gap: 0.85rem; align-items: center; width: 100%; }
  .frame {
    padding: 8px; border-radius: 30px;
    background: var(--c);
    box-shadow: 0 8px 20px -6px color-mix(in srgb, var(--c) 70%, transparent), 0 14px 26px rgba(0, 0, 0, 0.3);
  }
  canvas {
    display: block; width: min(80vw, 330px); aspect-ratio: 1; background: #fff;
    border-radius: 22px; touch-action: none; box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  .colors { display: flex; gap: 0.45rem; flex-wrap: wrap; justify-content: center; padding: 0.55rem 0.8rem; border-radius: 999px; }
  .swatch { width: 32px; height: 32px; border-radius: 50%; border: 3px solid rgba(255, 255, 255, 0.7); box-shadow: 0 3px 0 rgba(0, 0, 0, 0.3); transition: transform 0.1s; }
  .swatch.on { transform: scale(1.22) translateY(-2px); box-shadow: 0 0 0 3px var(--ring), 0 4px 0 rgba(0, 0, 0, 0.3); }
  .tools { display: flex; gap: 0.5rem; align-items: center; }
  .icon-btn.on { box-shadow: 0 0 0 3px var(--ring), 0 6px 16px -6px rgba(0, 0, 0, 0.5); }
  .dot { background: var(--ink); border-radius: 50%; display: block; }
</style>
