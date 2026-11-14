// Dark mode is the default; the choice is remembered per device.
export function getTheme() {
  return localStorage.getItem('bb-theme') || 'dark';
}
export function applyTheme(t = getTheme()) {
  document.documentElement.dataset.theme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = t === 'dark' ? '#16122c' : '#f6f0e3';
}
export function toggleTheme() {
  const t = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem('bb-theme', t);
  applyTheme(t);
  return t;
}
