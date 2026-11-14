<script>
  // Lewis lab (#/voice): see the presenter and hear his lines outside a game.
  import { onMount } from 'svelte';
  import Logo from '../components/Logo.svelte';
  import Lewis from '../components/Lewis.svelte';
  import { lewis, say, hush, hasLine, preload } from '../lib/presenter.svelte.js';
  import { LINES, line, placeLine, allSpokenLines } from '../content/presenter.js';
  import { TEAMS } from '../lib/room.js';
  import { CATEGORIES } from '../content/trivia.js';
  import { PLACES } from '../content/places.js';
  import { FAKEOUT } from '../content/fakeout.js';
  import { unlockAudio } from '../lib/sound.js';

  const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
  const TEAM_NAMES = Object.values(TEAMS).map((t) => t.name);

  let total = allSpokenLines().length;
  let ready = $state(0);
  let size = $state(240);

  onMount(async () => {
    await preload('');
    ready = allSpokenLines().filter((t) => hasLine(t)).length;
  });

  function go(texts) {
    unlockAudio();
    hush();
    texts.forEach((t, i) => say(t, { maxWait: 20000 + i * 8000 }));
  }

  const sayKind = (kind) =>
    go([LINES[kind].some((l) => l.includes('{team}')) ? line(kind, pickOne(TEAM_NAMES)) : line(kind)]);

  function question() {
    const q = pickOne(pickOne(CATEGORIES).questions);
    go([q.q]);
  }
  function miniRound() {
    const q = pickOne(pickOne(CATEGORIES).questions);
    const team = pickOne(TEAM_NAMES);
    go([line('pickTeam', team), q.q, line('buzzTeam', team), Math.random() < 0.5 ? line('correctTeam', team) : line('wrong')]);
  }
</script>

<main>
  <a href="#/" class="back"><Logo size={0.6} /></a>
  <h1>Meet Lewis</h1>
  <p class="muted sub">Your host. {ready} of {total} lines have audio.</p>

  <section class="stage card">
    <Lewis level={lewis.level} talking={lewis.speaking} {size} />
    <div class="bubble well">
      {#if lewis.speaking}{lewis.text}{:else}<span class="muted">Press a button to hear me!</span>{/if}
    </div>
  </section>

  <section class="card panel">
    <h2>Try it</h2>
    <div class="row">
      <button class="btn blue" onclick={question}>Read a question</button>
      <button class="btn purple" onclick={miniRound}>Mini round</button>
      <button class="btn green" onclick={() => go([pickOne(FAKEOUT).text])}>Fake Out prompt</button>
      <button class="btn sun" onclick={() => go([placeLine(pickOne(PLACES))])}>Pin Drop place</button>
      <button class="btn ghost" onclick={hush}>Stop</button>
    </div>
    <div class="row">
      {#each Object.keys(LINES) as kind}
        <button class="btn small ghost" onclick={() => sayKind(kind)}>{kind}</button>
      {/each}
    </div>
    <label>
      <span>Size <b>{size}px</b></span>
      <input type="range" min="100" max="360" step="10" bind:value={size} />
    </label>
  </section>
</main>

<style>
  main { max-width: 860px; margin: 0 auto; padding: 1.5rem 1rem 3rem; display: flex; flex-direction: column; align-items: center; gap: 1.2rem; }
  .back { text-decoration: none; }
  h1 { font-size: 2.6rem; margin: 0; }
  h2 { font-size: 1.4rem; margin: 0; }
  .sub { margin: -0.6rem 0 0; text-align: center; }
  .stage { width: 100%; display: flex; align-items: center; gap: 1.4rem; }
  .bubble { flex: 1; padding: 1rem 1.2rem; min-height: 90px; display: flex; align-items: center; font-size: 1.25rem; }
  .panel { width: 100%; display: flex; flex-direction: column; gap: 0.9rem; }
  .row { display: flex; flex-wrap: wrap; gap: 0.6rem; }
  label { display: flex; flex-direction: column; gap: 0.35rem; }
  label span { display: flex; justify-content: space-between; }
  input[type='range'] { width: 100%; accent-color: var(--sun); }
  @media (max-width: 600px) { .stage { flex-direction: column; } }
</style>
