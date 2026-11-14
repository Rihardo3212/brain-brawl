<script>
  import Logo from '../components/Logo.svelte';
  import { DEVELOPER } from '../lib/brand.js';

  const steps = [
    { e: '📺', t: 'Open the game on a big screen', d: 'Laptop, TV or projector. Press "Host a game".' },
    { e: '📱', t: 'Join with your phone', d: 'Scan the QR code or type the 4-letter room code. Up to 4 players.' },
    { e: '🎨', t: 'Draw yourself', d: 'Your doodle is your player picture for the whole game.' },
    { e: '👑', t: 'The VIP starts', d: 'The first player to join picks the game length and starts. The VIP plays too.' },
    { e: '🎯', t: 'Pick a question', d: 'The player whose turn it is picks a category and points on their phone.' },
    { e: '🔔', t: 'Buzz!', d: 'Wait for the buzzer to light up. Buzz too early and you are locked for a moment.' },
    { e: '✅', t: 'Answer fast', d: 'The fastest buzzer picks one of 4 answers. Right = win the points and pick next. Wrong = lose them, and the others can buzz.' },
    { e: '🏆', t: 'Most points wins', d: 'When the board is empty, the highest score takes the crown.' }
  ];
</script>

<main>
  <a href="#/" class="back"><Logo size={0.6} /></a>
  <h1 class="on-bg">How to play</h1>
  <ol>
    {#each steps as s, i}
      <li class="card pop-in" style="animation-delay:{i * 60}ms">
        <span class="e">{s.e}</span>
        <div>
          <h3>{s.t}</h3>
          <p class="muted">{s.d}</p>
        </div>
      </li>
    {/each}
  </ol>
  <a class="btn big" href="#/">Let's play</a>
  <footer class="footer">a {DEVELOPER} game</footer>
</main>

<style>
  main {
    max-width: 640px;
    margin: 0 auto;
    padding: 2rem 1.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
  }
  .back { text-decoration: none; }
  h1 { font-size: 2.4rem; }
  ol { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.8rem; width: 100%; }
  li { display: flex; gap: 1rem; align-items: center; padding: 0.9rem 1.1rem; }
  .e { font-size: 2.2rem; }
  h3 { font-size: 1.2rem; }
  p { margin: 0.15rem 0 0; }
</style>
