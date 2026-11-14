<script>
  let { until, total, now } = $props();
  const frac = $derived(Math.max(0, Math.min(1, (until - now) / total)));
</script>

<div class="timer" class:low={frac < 0.25}><div style="transform:scaleX({frac})"></div></div>

<style>
  .low > div { background: var(--red); }
</style>
