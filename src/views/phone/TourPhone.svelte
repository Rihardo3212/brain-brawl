<script>
  import ReactBar from '../../components/ReactBar.svelte';
  import StepFlow from '../../components/StepFlow.svelte';
  import { MODES } from '../../lib/modes.js';
  import { POINTS } from '../../engine/tour.js';
  import { sfx } from '../../lib/sound.js';

  let { s, myUnit, send, now, react } = $props();

  const t = $derived(s.tour);
  const secs = (until) => Math.max(0, Math.ceil((until - now) / 1000));
  const mine = $derived(t?.rolls?.[myUnit]);
  const chooser = $derived(!!t && t.chooser === myUnit);
  const ev = $derived(t?.events?.[myUnit]);
  const mode = $derived(t?.mode ? MODES[t.mode] : null);
  const DICE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  let rolling = $state(false);

  function roll() {
    if (rolling) return;
    rolling = true;
    sfx.pop();
    navigator.vibrate?.([30, 40, 30, 40, 60]);
    send('troll');
    setTimeout(() => (rolling = false), 1500);
  }
</script>

{#if t}
  {#if s.phase === 'troll'}
    <div class="stack center">
      <p class="qmini">🗺️ Round {t.round} of {t.rounds} · ⏱ {secs(t.until)}</p>
      {#if mine}
        <div class="die pop-in">{DICE[mine]}</div>
        <h2>{s.teamMode ? 'Your team rolled' : 'You rolled'} {mine}!</h2>
        <p class="muted">Watch your piece on the big screen.</p>
        <ReactBar onReact={react} />
      {:else}
        {#if chooser}<p class="crown">👑 Your roll picks the next game!</p>{/if}
        <button class="btn sun huge" class:shake={rolling} onclick={roll}>🎲<br />Roll!</button>
        {#if s.teamMode}<p class="muted">Anyone in your team can roll.</p>{/if}
      {/if}
    </div>

  {:else if s.phase === 'tmove'}
    <div class="stack center">
      <div class="bigemoji bounce">👀</div>
      <h2>Watch the board!</h2>
      {#if ev}
        <p>
          {#if ev.lap}🏁 Lap bonus +{POINTS.lap}! {/if}
          {#if ev.kind === 'bonus'}⭐ Bonus space +{POINTS.bonus}!{:else if ev.kind === 'trap'}💀 Trap space!{:else if ev.kind === 'mode'}{MODES[t.board[ev.to].m].icon} {MODES[t.board[ev.to].m].name} space{/if}
        </p>
      {/if}
      <ReactBar onReact={react} />
    </div>

  {:else if s.phase === 'tpick' && mode}
    <div class="stack center" style="--mc:{mode.color}">
      <p class="muted">Next game</p>
      <span class="icon-tile" style="--sz:72px">{mode.icon}</span>
      <h2 style="color:{mode.color}">{mode.name}</h2>
      <div class="wide"><StepFlow steps={mode.steps} color={mode.color} size="small" animate /></div>
      <p class="muted">Starting in {secs(t.until)}…</p>
    </div>

  {:else if s.phase === 'tscore'}
    <div class="stack center pop-in">
      <div class="bigemoji">{t.place[myUnit] >= 500 ? '🏆' : t.place[myUnit] ? '👏' : '😅'}</div>
      <h2>{t.place[myUnit] >= 500 ? 'You won that one!' : t.place[myUnit] ? 'Nice!' : 'No points this time'}</h2>
      {#if t.place[myUnit]}<p class="pts">+{t.place[myUnit]}</p>{/if}
      <ReactBar onReact={react} />
    </div>
  {/if}
{/if}

<style>
  .qmini { margin: 0; text-align: center; }
  .crown { margin: 0; font-weight: 900; color: #ffc400; }
  .btn.huge { font-size: 2.4rem; line-height: 1.1; padding: 1.4rem 2.6rem; border-radius: 32px; }
  .shake { animation: shake 0.4s; }
  @keyframes shake { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-12deg); } 75% { transform: rotate(12deg); } }
  .die { font-size: 6rem; line-height: 1; }
  .wide { width: 100%; }
  .pts { font-family: var(--font-display); font-size: 2.2rem; color: var(--green); margin: 0; }
</style>
