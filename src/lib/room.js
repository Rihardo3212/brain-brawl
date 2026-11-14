// Room codes, player identity and helpers shared by host and phones.

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I / O, easy to read out loud

export function newRoomCode() {
  let c = '';
  for (let i = 0; i < 4; i++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return c;
}

export function cleanCode(s) {
  return (s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
}

// One id per browser tab, so a refresh keeps you in the game,
// and two tabs on one computer can still be two players (local test mode).
export function myId() {
  let id = sessionStorage.getItem('bb-id');
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem('bb-id', id);
  }
  return id;
}

export const PLAYER_COLORS = ['#ff3c28', '#0ab9e6', '#ffb400', '#22c55e'];
export const MAX_PLAYERS = 4;

export function joinUrl(code) {
  const base = location.href.split('#')[0];
  return `${base}#/join/${code}`;
}
