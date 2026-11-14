<script>
  import ReactBar from '../../components/ReactBar.svelte';
  let { s, myUnit, unit, send, isCtrl, react } = $props();
  const place = $derived(s.results.ranked.indexOf(myUnit) + 1);
  const won = $derived(s.results.winners.includes(myUnit));
</script>

<div class="stack center pop-in">
  <div class="bigemoji bounce">{won ? '🏆' : place === 2 ? '🥈' : place === 3 ? '🥉' : '🙃'}</div>
  <h2>{won ? (s.teamMode ? 'Your team wins!' : 'You win!') : `#${place}`}</h2>
  <p class="muted">{unit?.score ?? 0} points</p>
  {#if isCtrl}
    <button class="btn green big" onclick={() => send('again')}>Play again</button>
  {:else}
    <p class="muted">Waiting for {s.mode === 'host' ? s.hostName : s.players[s.vip]?.name}…</p>
  {/if}
  <ReactBar onReact={react} />
</div>
