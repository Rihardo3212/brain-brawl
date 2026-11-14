// Room codes, player identity and constants shared by the big screen and phones.

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

export const MAX_SOLO = 4;      // more players than this = team mode
export const MAX_PLAYERS = 16;

export const PLAYER_COLORS = [
  '#ff3c28', '#0ab9e6', '#ffb400', '#22c55e',
  '#a855f7', '#ff6fb5', '#14b8a6', '#f97316',
  '#6366f1', '#84cc16', '#e11d48', '#06b6d4',
  '#eab308', '#10b981', '#d946ef', '#64748b'
];

export const TEAMS = {
  red: { name: 'Red Rockets', color: '#ff3c28', emoji: '🚀' },
  blue: { name: 'Blue Blasters', color: '#0ab9e6', emoji: '💥' },
  yellow: { name: 'Yellow Yetis', color: '#ffb400', emoji: '🦍' },
  green: { name: 'Green Geckos', color: '#22c55e', emoji: '🦎' }
};
export const TEAM_KEYS = Object.keys(TEAMS);

export const REACTIONS = ['😂', '🔥', '😱', '👏', '🤯', '😭', '💀', '🎉'];

export function joinUrl(code) {
  const base = location.href.split('#')[0];
  return `${base}#/join/${code}`;
}
