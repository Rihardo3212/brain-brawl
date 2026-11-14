<script>
  let { src = null, color = '#888', name = '', size = 72, crown = false, dim = false } = $props();
</script>

<div class="avatar" class:dim style="--c:{color}; --sz:{size}px">
  <div class="face">
    {#if src}
      <img {src} alt={name} />
    {:else}
      <span class="initial">{(name || '?').slice(0, 1).toUpperCase()}</span>
    {/if}
  </div>
  {#if crown}<span class="crown" title="VIP">👑</span>{/if}
</div>

<style>
  /* a chunky plastic frame in the player's color */
  .avatar {
    position: relative;
    width: var(--sz);
    height: var(--sz);
    border-radius: 30%;
    padding: calc(var(--sz) * 0.075);
    background: var(--c);
    box-shadow:
      0 calc(var(--sz) * 0.05) 0 color-mix(in srgb, var(--c) 55%, #000),
      0 calc(var(--sz) * 0.09) calc(var(--sz) * 0.14) rgba(0, 0, 0, 0.3);
    flex-shrink: 0;
  }
  .face {
    width: 100%; height: 100%;
    border-radius: 24%;
    background: #fff;
    overflow: hidden;
    display: grid; place-items: center;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.25);
  }
  .dim { opacity: 0.4; filter: grayscale(1); }
  img { width: 100%; height: 100%; object-fit: contain; }
  .initial { font-family: var(--font-display); font-size: calc(var(--sz) * 0.45); color: var(--c); }
  .crown {
    position: absolute;
    top: calc(var(--sz) * -0.34);
    right: calc(var(--sz) * -0.2);
    font-size: calc(var(--sz) * 0.4);
    transform: rotate(18deg);
    filter: drop-shadow(0 3px 0 rgba(0, 0, 0, 0.3));
  }
</style>
