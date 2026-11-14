<script>
  import Logo from '../components/Logo.svelte';
  import { cleanCode } from '../lib/room.js';
  import { isLocal } from '../lib/db.js';
  import { DEVELOPER } from '../lib/brand.js';
  import { unlockAudio } from '../lib/sound.js';

  let code = $state('');

  function join(e) {
    e.preventDefault();
    unlockAudio();
    if (cleanCode(code).length === 4) location.hash = `#/join/${cleanCode(code)}`;
  }
</script>

<main>
  <div class="hero pop-in"><Logo size={1.25} /></div>
  <p class="tag on-bg">The party trivia game where your phone is the buzzer.</p>

  <div class="choices">
    <section class="card choice selectable">
      <div class="emoji">📺</div>
      <h2>Big screen</h2>
      <p class="muted">Open the game on a laptop or TV everyone can see.</p>
      <a class="btn big block" href="#/host" onclick={unlockAudio}>Host a game</a>
    </section>

    <section class="card choice selectable">
      <div class="emoji">📱</div>
      <h2>Phone</h2>
      <p class="muted">Got a room code? Jump in.</p>
      <form onsubmit={join}>
        <input
          class="field code"
          placeholder="ABCD"
          maxlength="4"
          autocapitalize="characters"
          autocomplete="off"
          bind:value={code}
          oninput={() => (code = cleanCode(code))}
        />
        <button class="btn big block" disabled={code.length !== 4}>Join</button>
      </form>
    </section>
  </div>

  <a class="btn ghost" href="#/how">How to play</a>

  {#if isLocal}
    <p class="notice">
      Local test mode: Firebase is not set up yet, so host and players have to be tabs in this browser.
    </p>
  {/if}

  <footer class="footer">a {DEVELOPER} game</footer>
</main>

<style>
  main {
    max-width: 860px;
    margin: 0 auto;
    padding: 3rem 1.2rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }
  .tag { font-size: 1.25rem; margin: 0; }
  .choices {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.2rem;
    width: 100%;
  }
  .choice { display: flex; flex-direction: column; gap: 0.6rem; align-items: center; }
  .choice p { margin: 0 0 0.4rem; }
  .emoji { font-size: 2.6rem; }
  form { display: flex; flex-direction: column; gap: 0.7rem; width: 100%; }
  .code { letter-spacing: 0.4em; text-transform: uppercase; font-weight: 700; }
</style>
