<script>
  import { onMount } from 'svelte';
  let { color = '#5b2bd6', onDone, title = 'Draw yourself!' } = $props();

  const COLORS = ['#2d2d2d', '#ff3c28', '#ffb400', '#22c55e', '#0ab9e6', '#8a4fff', '#7a4a2a', '#ffffff'];
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
  <canvas
    bind:this={canvas}
    width={SIZE}
    height={SIZE}
    style="border-color:{color}"
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
  ></canvas>

  <div class="colors">
    {#each COLORS as c}
      <button
        class="swatch"
        class:on={pen === c}
        style="background:{c}"
        aria-label="color {c}"
        onclick={() => (pen = c)}
      ></button>
    {/each}
  </div>

  <div class="tools">
    {#each [5, 10, 20] as w}
      <button class="tool" class:on={width === w} onclick={() => (width = w)} aria-label="brush {w}">
        <span style="width:{w}px;height:{w}px"></span>
      </button>
    {/each}
    <button class="tool text" onclick={undo}>Undo</button>
    <button class="tool text" onclick={clear}>Clear</button>
  </div>

  <button class="btn big block" disabled={empty} onclick={done}>Done!</button>
</div>

<style>
  .pad { display: flex; flex-direction: column; gap: 0.8rem; align-items: center; width: 100%; }
  canvas {
    width: min(82vw, 340px);
    aspect-ratio: 1;
    background: #fff;
    border-radius: 26px;
    border: 7px solid;
    touch-action: none;
    box-shadow: var(--shadow);
  }
  .colors {
    display: flex; gap: 0.45rem; flex-wrap: wrap; justify-content: center;
    background: #fff; padding: 0.5rem 0.7rem; border-radius: 999px; box-shadow: var(--shadow);
  }
  .swatch {
    width: 32px; height: 32px; border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.12);
    transition: transform 0.1s;
  }
  .swatch.on { transform: scale(1.2); box-shadow: 0 0 0 3px #fff, 0 0 0 6px var(--ring); }
  .tools { display: flex; gap: 0.45rem; }
  .tool {
    min-width: 44px; height: 44px; border-radius: 14px;
    background: #fff; color: var(--ink); box-shadow: 0 3px 0 #cfcfcf;
    display: grid; place-items: center;
  }
  .tool span { background: var(--ink); border-radius: 50%; display: block; }
  .tool.on { box-shadow: 0 0 0 3px var(--ring); }
  .tool.text { padding: 0 0.8rem; font-weight: 800; }
</style>
