<script>
  // The question board. Used big on the main screen and small on the picking phone.
  let { board, onPick = null, compact = false, highlight = null } = $props();
</script>

<div class="board" class:compact style="--cols:{board.cats.length}">
  {#each board.cats as cat}
    <div class="cat">
      <span class="icon">{cat.icon}</span>
      <span class="name">{cat.name}</span>
    </div>
  {/each}
  {#each Array(board.rows) as _, r}
    {#each board.cats as _, c}
      {@const used = board.used[`${c}-${r}`]}
      <button
        class="cell"
        class:used
        class:hl={highlight && highlight.c === c && highlight.r === r}
        disabled={used || !onPick}
        onclick={() => onPick && onPick(c, r)}
      >
        {used ? '' : (r + 1) * 100}
      </button>
    {/each}
  {/each}
</div>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    gap: 0.75rem;
    width: 100%;
  }
  .cat {
    background: var(--red);
    color: #fff;
    border-radius: 18px;
    padding: 0.6rem 0.4rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    min-height: 5.5rem;
    box-shadow: 0 5px 0 var(--red-dark);
  }
  .icon { font-size: 1.9rem; filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.2)); }
  .name { font-weight: 900; font-size: 1.05rem; line-height: 1.1; }
  .cell {
    background: #fff;
    border-radius: 18px;
    font-size: 2.3rem;
    font-weight: 900;
    color: var(--blue);
    min-height: 5rem;
    box-shadow: 0 5px 0 #cfcfcf, var(--shadow);
    transition: transform 0.1s;
  }
  .cell:disabled { cursor: default; }
  .cell:not(:disabled):hover { animation: ring 0.9s ease-in-out infinite alternate; }
  .cell:not(:disabled):active { transform: translateY(4px); box-shadow: 0 1px 0 #cfcfcf; }
  .cell.used { background: rgba(0, 0, 0, 0.06); box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.08); }
  .cell.hl { animation: pulse 0.5s ease infinite alternate; }
  @keyframes pulse { to { transform: scale(1.08); } }

  .compact { gap: 0.35rem; }
  .compact .cat { min-height: 3.4rem; border-radius: 12px; padding: 0.3rem 0.15rem; box-shadow: 0 3px 0 var(--red-dark); }
  .compact .icon { font-size: 1.1rem; }
  .compact .name { font-size: 0.62rem; }
  .compact .cell { font-size: 1.1rem; min-height: 3.2rem; border-radius: 12px; box-shadow: 0 3px 0 #cfcfcf; }
</style>
