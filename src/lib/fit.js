// Svelte action: shrinks a screen's content (CSS zoom) so it fits its box with no scrolling.
// Usage: <div class="box" use:fit={{ min: 0.5 }}><div class="fit-in">…</div></div>
// The box needs a fixed height (flex: 1; min-height: 0) and overflow: auto as a last resort.
// The inner element should have min-height: 100% so normal layouts still fill the space.
// Content with [data-nofit] inside (drawing canvases, maps on phones) is never zoomed,
// because touch/pointer math is safest at zoom 1; those screens fit by CSS instead.

export function fit(box, opts = {}) {
  let { min = 0.5 } = opts;
  const inner = box.firstElementChild;
  let raf = 0;
  let mo;

  // While someone is typing, the phone keyboard shrinks the screen. Don't shrink the text then.
  const typing = () => {
    const a = document.activeElement;
    return a && box.contains(a) && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA');
  };

  function measure() {
    raf = 0;
    if (!inner || typing()) return;
    const avail = box.clientHeight;
    if (!avail) return;
    let next = 1;
    if (!inner.querySelector('[data-nofit]')) {
      inner.style.zoom = '1';
      const need = inner.scrollHeight;
      if (need > avail) next = Math.max(min, Math.floor(((avail - 4) / need) * 1000) / 1000);
    }
    inner.style.zoom = String(next);
    mo.takeRecords(); // ignore our own zoom changes, or we'd measure every frame
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };

  const ro = new ResizeObserver(schedule);
  ro.observe(box);
  mo = new MutationObserver(schedule);
  if (inner) mo.observe(inner, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'style', 'src'] });
  // images (place photos, avatars) change height when they finish loading
  box.addEventListener('load', schedule, true);
  box.addEventListener('focusout', schedule);
  window.addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', schedule);
  document.fonts?.ready.then(schedule);
  schedule();

  return {
    update(o = {}) { min = o.min ?? 0.5; schedule(); },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      box.removeEventListener('load', schedule, true);
      box.removeEventListener('focusout', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
    },
  };
}
