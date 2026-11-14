// Simple wins count, kept on the main screen's browser.

const KEY = 'bb-wins';

export function getWins() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}

export function addWin(name) {
  const w = getWins();
  const k = name.trim();
  w[k] = (w[k] || 0) + 1;
  localStorage.setItem(KEY, JSON.stringify(w));
}

export function topWins(n = 5) {
  return Object.entries(getWins())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}
