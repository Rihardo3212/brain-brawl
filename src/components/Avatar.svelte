<script>
  let { src = null, color = '#ccc', name = '', size = 72, crown = false, dim = false } = $props();
</script>

<div class="avatar" class:dim style="--c:{color}; --sz:{size}px">
  {#if src}
    <img {src} alt={name} />
  {:else}
    <span class="initial">{(name || '?').slice(0, 1).toUpperCase()}</span>
  {/if}
  {#if crown}<span class="crown" title="VIP">👑</span>{/if}
</div>

<style>
  .avatar {
    position: relative;
    width: var(--sz);
    height: var(--sz);
    border-radius: 30%;
    background: #fff;
    border: calc(var(--sz) * 0.075) solid var(--c);
    box-shadow: 0 calc(var(--sz) * 0.05) 0 rgba(0, 0, 0, 0.15);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  .dim { opacity: 0.4; filter: grayscale(1); }
  img { width: 100%; height: 100%; object-fit: contain; border-radius: 24%; }
  .initial { font-weight: 900; font-size: calc(var(--sz) * 0.45); color: var(--c); }
  .crown {
    position: absolute;
    top: calc(var(--sz) * -0.32);
    right: calc(var(--sz) * -0.18);
    font-size: calc(var(--sz) * 0.38);
    transform: rotate(18deg);
    filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.2));
  }
</style>
