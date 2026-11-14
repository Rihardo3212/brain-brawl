<script>
  // Full-screen effects for the big screen: confetti, stamps and floating reactions.
  import { onMount, onDestroy } from 'svelte';
  import { onFx } from '../lib/fx.js';

  const COLORS = ['#ff3c28', '#0ab9e6', '#ffc400', '#22c55e', '#a855f7', '#ff6fb5', '#ffffff'];

  let canvas;
  let parts = [];
  let raf = null;
  let stamps = $state([]);
  let floats = $state([]);
  let uid = 0;
  let off;

  function confetti(amount, colors) {
    const w = canvas.width, h = canvas.height;
    for (let i = 0; i < amount; i++) {
      const left = i % 2 === 0;
      parts.push({
        x: left ? -10 : w + 10,
        y: h * (0.55 + Math.random() * 0.3),
        vx: (left ? 1 : -1) * (6 + Math.random() * 10) * (w / 1400),
        vy: -(12 + Math.random() * 14) * (h / 900),
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        s: 7 + Math.random() * 9,
        c: (colors || COLORS)[Math.floor(Math.random() * (colors || COLORS).length)],
        life: 0
      });
    }
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function frame() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const g = 0.45 * (canvas.height / 900);
    parts = parts.filter((p) => p.y < canvas.height + 40 && p.life < 400);
    for (const p of parts) {
      p.vy += g; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 * (0.4 + Math.abs(Math.sin(p.life / 6))));
      ctx.restore();
    }
    raf = parts.length ? requestAnimationFrame(frame) : null;
    if (!raf) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  onMount(() => {
    resize();
    window.addEventListener('resize', resize);
    off = onFx((e) => {
      if (e.type === 'confetti') confetti(e.amount, e.colors);
      if (e.type === 'stamp') {
        const id = ++uid;
        stamps = [{ id, ...e, rot: (Math.random() * 14 - 7).toFixed(1) }]; // newest stamp replaces the old one
        setTimeout(() => (stamps = stamps.filter((s) => s.id !== id)), 1500);
      }
      if (e.type === 'react') {
        const id = ++uid;
        floats = [...floats, { id, e: e.e, color: e.color, x: 8 + Math.random() * 84, d: (Math.random() * 1.2 + 2.6).toFixed(2), sway: (Math.random() * 60 - 30).toFixed(0) }];
        setTimeout(() => (floats = floats.filter((f) => f.id !== id)), 4200);
      }
    });
  });
  onDestroy(() => {
    off?.();
    window.removeEventListener('resize', resize);
    if (raf) cancelAnimationFrame(raf);
  });
</script>

<div class="fx">
  <canvas bind:this={canvas}></canvas>
  {#each stamps as s (s.id)}
    <div class="stamp" style="--c:{s.color}; --rot:{s.rot}deg">
      <span class="txt">{s.text}</span>
      {#if s.sub}<span class="sub">{s.sub}</span>{/if}
    </div>
  {/each}
  {#each floats as f (f.id)}
    <div class="float" style="left:{f.x}%; --d:{f.d}s; --sway:{f.sway}px; --c:{f.color}">
      <span>{f.e}</span>
    </div>
  {/each}
</div>

<style>
  .fx { position: fixed; inset: 0; pointer-events: none; z-index: 50; overflow: hidden; }
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  .stamp {
    position: absolute; left: 50%; top: 42%;
    display: flex; flex-direction: column; align-items: center;
    transform: translate(-50%, -50%) rotate(var(--rot));
    animation: stamp 1.5s cubic-bezier(0.2, 1.5, 0.4, 1) both;
  }
  .txt {
    font-family: var(--font-display);
    font-size: clamp(4rem, 10vw, 9rem);
    color: #fff;
    background: var(--c);
    padding: 0.08em 0.5em 0.14em;
    border-radius: 0.32em;
    border: 0.07em solid #fff;
    text-shadow: 0 0.05em 0 rgba(0, 0, 0, 0.3);
    box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.4), 0 0.09em 0 color-mix(in srgb, var(--c) 50%, #000), 0 0.2em 0.6em rgba(0, 0, 0, 0.4);
    line-height: 1;
    white-space: nowrap;
  }
  .sub {
    margin-top: 0.7rem; font-family: var(--font-display); font-size: 2.1rem; color: #2b2240;
    background: #fff; padding: 0.1em 0.9em; border-radius: 16px; transform: rotate(2deg);
    box-shadow: 0 5px 0 rgba(0, 0, 0, 0.25);
  }
  @keyframes stamp {
    0% { transform: translate(-50%, -50%) rotate(var(--rot)) scale(3); opacity: 0; }
    18% { transform: translate(-50%, -50%) rotate(var(--rot)) scale(0.92); opacity: 1; }
    26% { transform: translate(-50%, -50%) rotate(var(--rot)) scale(1.04); }
    80% { transform: translate(-50%, -50%) rotate(var(--rot)) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -50%) rotate(var(--rot)) scale(1.1); opacity: 0; }
  }
  .float {
    position: absolute; bottom: -80px;
    animation: rise var(--d) ease-out forwards;
  }
  .float span {
    display: grid; place-items: center;
    width: 76px; height: 76px; font-size: 48px;
    background: #fff; border-radius: 50%;
    box-shadow: 0 0 0 6px var(--c), 0 6px 0 6px rgba(0, 0, 0, 0.25);
  }
  @keyframes rise {
    0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
    12% { opacity: 1; transform: translate(0, -80px) scale(1.1); }
    100% { transform: translate(var(--sway), -75vh) scale(0.9); opacity: 0; }
  }
</style>
