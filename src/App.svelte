<script>
  import Home from './pages/Home.svelte';
  import Host from './pages/Host.svelte';
  import Play from './pages/Play.svelte';
  import How from './pages/How.svelte';

  let hash = $state(location.hash);
  $effect(() => {
    const on = () => (hash = location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  });

  const route = $derived.by(() => {
    const parts = hash.replace(/^#\/?/, '').split('/');
    return { page: parts[0] || '', arg: parts[1] || '' };
  });
</script>

{#if route.page === 'host'}
  <Host arg={route.arg} />
{:else if route.page === 'join'}
  {#key route.arg}
    <Play code={route.arg} />
  {/key}
{:else if route.page === 'how'}
  <How />
{:else}
  <Home />
{/if}
