<script>
  let { size = 1 } = $props();
</script>

<div class="logo" style="--s:{size}">
  <span class="word one">BRAIN</span>
  <span class="bolt">⚡</span>
  <span class="word two">BRAWL</span>
</div>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.18em;
    font-size: calc(3rem * var(--s));
    font-weight: 900;
    line-height: 1;
    font-style: italic;
    background: var(--red);
    color: #fff;
    padding: 0.18em 0.5em 0.2em 0.45em;
    border-radius: 0.45em;
    transform: rotate(-3deg);
    box-shadow: 0 0.09em 0 var(--red-dark), 0 0.2em 0.5em rgba(0, 0, 0, 0.15);
    letter-spacing: -0.01em;
  }
  .two { color: var(--sun); }
  .bolt {
    font-style: normal;
    font-size: 0.85em;
    display: inline-block;
    animation: zap 1.6s ease-in-out infinite;
  }
  @keyframes zap {
    0%, 100% { transform: rotate(-10deg) scale(1); }
    50% { transform: rotate(10deg) scale(1.15); }
  }
</style>
