<script>
  // Game-show marquee: a plastic frame with chasing light bulbs around the edge.
  let { children, color = '#ffc400', lit = true } = $props();
  const TOP = 22, SIDE = 6;
  const bulbs = [];
  for (let i = 0; i < TOP; i++) bulbs.push({ x: (i / (TOP - 1)) * 100, y: 0 });
  for (let i = 1; i < SIDE; i++) bulbs.push({ x: 100, y: (i / SIDE) * 100 });
  for (let i = TOP - 1; i >= 0; i--) bulbs.push({ x: (i / (TOP - 1)) * 100, y: 100 });
  for (let i = SIDE - 1; i >= 1; i--) bulbs.push({ x: 0, y: (i / SIDE) * 100 });
</script>

<div class="marquee" class:lit style="--b:{color}">
  <div class="lights">
    {#each bulbs as b, i}
      <span class="bulb" class:odd={i % 2} style="left:{b.x}%; top:{b.y}%"></span>
    {/each}
  </div>
  <div class="inner">{@render children()}</div>
</div>

<style>
  .marquee {
    position: relative;
    padding: 24px;
    border-radius: 36px;
    background: #e0213a;
    box-shadow: 0 10px 30px -8px rgba(224, 33, 58, 0.6), 0 22px 50px rgba(0, 0, 0, 0.5);
    width: 100%;
  }
  .lights { position: absolute; inset: 12px; pointer-events: none; }
  .bulb {
    position: absolute; width: 13px; height: 13px; margin: -6.5px 0 0 -6.5px;
    border-radius: 50%; background: #7a1020; box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.4);
  }
  .lit .bulb { animation: chase 0.7s steps(1) infinite; }
  .lit .bulb.odd { animation-delay: 0.35s; }
  @keyframes chase {
    0% { background: radial-gradient(circle at 35% 35%, #fff, var(--b) 60%); box-shadow: 0 0 12px 3px var(--b); }
    50% { background: #7a1020; box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.4); }
  }
  .inner {
    background: #ffffff;
    color: #2b2240;
    border-radius: 22px;
    position: relative;
    box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.12);
  }
</style>
