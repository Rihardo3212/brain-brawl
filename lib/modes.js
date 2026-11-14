// Game modes: names, descriptions and lengths, used by the lobby and the How to play page.

export const MODES = {
  board: {
    id: 'board',
    steps: [
      { icon: '🎯', label: 'Pick a tile' },
      { icon: '🔔', label: 'Buzz first' },
      { icon: '✅', label: 'Answer right', tag: '+points' },
      { icon: '⚡', label: 'Bet it all in the final' }
    ],
    name: 'Brain Board',
    icon: '🧠',
    color: '#ff3b4f',
    tagline: 'Pick a tile, buzz first, answer fast.',
    how: [
      'The player (or team) in control picks a category and points.',
      'Buzz first when the buzzer lights up, then answer.',
      'Right = win the points and pick next. Wrong = lose them.',
      'Ends with a final round: bet your points on one last question.'
    ],
    min: 1,
    hostRole: 'The host reads the questions and judges spoken answers.',
    lengths: {
      quick: { label: 'Quick', detail: '4 × 4 board + final · ~15 min', cats: 4, rows: 4 },
      full: { label: 'Full', detail: '6 × 5 board + final · ~30 min', cats: 6, rows: 5 },
      tiny: { label: 'Tiny', detail: 'test board', cats: 2, rows: 1, hidden: true }
    }
  },
  wedge: {
    id: 'wedge',
    steps: [
      { icon: '🎡', label: 'The wheel spins' },
      { icon: '📱', label: 'Everyone answers' },
      { icon: '🥧', label: 'Best answer grabs the wedge' },
      { icon: '🏆', label: 'Fill your pie first' }
    ],
    name: 'Wedge Rush',
    icon: '🥧',
    color: '#2f8cff',
    tagline: 'Spin, answer at once, grab the wedges.',
    how: [
      'The wheel spins and lands on a category.',
      'Everyone answers on their phone at the same time.',
      'The best answer from someone still missing that wedge wins it.',
      'Fill your pie first to win. Some rounds are "closest number wins".'
    ],
    min: 1,
    hostRole: 'The host reads the questions out loud and keeps the energy up.',
    lengths: {
      quick: { label: 'Quick', detail: 'First to 4 wedges · ~10 min', need: 4 },
      full: { label: 'Full', detail: 'Collect all 6 wedges · ~20 min', need: 6 },
      tiny: { label: 'Tiny', detail: 'test', need: 1, hidden: true }
    }
  },
  fakeout: {
    id: 'fakeout',
    steps: [
      { icon: '🤔', label: 'A weird true fact' },
      { icon: '🤥', label: 'Write a fake answer' },
      { icon: '🕵️', label: 'Spot the truth', tag: '+1000' },
      { icon: '😈', label: 'Fool your friends', tag: '+500 each' }
    ],
    name: 'Fake Out',
    icon: '🤥',
    color: '#a855f7',
    tagline: 'Write a believable lie. Find the truth.',
    how: [
      'A weird but true fact appears with a blank.',
      'Everyone secretly writes a fake answer that sounds real.',
      'Then everyone tries to pick the real answer.',
      '+1000 for finding the truth, +500 for every player you fool.'
    ],
    min: 2,
    hostRole: 'The host reads the facts and the answers out loud.',
    lengths: {
      quick: { label: 'Quick', detail: '5 facts · ~10 min', rounds: 5 },
      full: { label: 'Full', detail: '8 facts · ~18 min', rounds: 8 },
      tiny: { label: 'Tiny', detail: 'test', rounds: 1, hidden: true }
    }
  },
  doodle: {
    id: 'doodle',
    steps: [
      { icon: '🤫', label: 'Pick a secret word' },
      { icon: '✏️', label: 'Draw it live' },
      { icon: '⌨️', label: 'Everyone guesses' },
      { icon: '⚡', label: 'Faster = more points' }
    ],
    name: 'Doodle Dash',
    icon: '✏️',
    color: '#22c55e',
    tagline: 'One draws, everyone else guesses.',
    how: [
      'The artist picks one of three secret words.',
      'They draw it on their phone; it appears live on the big screen.',
      'Everyone else types guesses. Faster = more points.',
      'The artist scores for every correct guess. Hard words pay double.'
    ],
    min: 2,
    hostRole: 'The host commentates. Everyone else draws and guesses.',
    lengths: {
      quick: { label: 'Quick', detail: 'Everyone draws once · ~8 min', perPlayer: 1, minRounds: 3, maxRounds: 6 },
      full: { label: 'Full', detail: 'Everyone draws twice · ~16 min', perPlayer: 2, minRounds: 6, maxRounds: 12 },
      tiny: { label: 'Tiny', detail: 'test', perPlayer: 1, minRounds: 1, maxRounds: 1, hidden: true }
    }
  }
};

export const MODE_LIST = ['board', 'wedge', 'fakeout', 'doodle'];

// Setup steps for the How to play page.
export const SETUP_STEPS = [
  { icon: '📺', label: 'Open on a big screen' },
  { icon: '📱', label: 'Scan the QR code' },
  { icon: '🎨', label: 'Draw yourself' },
  { icon: '👑', label: 'VIP picks a game' }
];
export const EXTRAS = [
  { icon: '🎽', label: '5+ players = teams' },
  { icon: '🎤', label: 'Optional host' },
  { icon: '😂', label: 'Send reactions' },
  { icon: '🌙', label: 'Light or dark' }
];

export function lengthOf(settings) {
  const m = MODES[settings.game] || MODES.board;
  return m.lengths[settings.length] || m.lengths.quick;
}
