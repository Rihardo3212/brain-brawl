// Everything Lewis, the presenter, can say. Cheesy on purpose.
// Lines are turned into audio files ahead of time (tools/voice), so every line must be
// fixed text: {team} lines are made once per team name, there are no player names.
// After changing lines or questions, run the voice generator again (see tools/voice/README.md).

import { TEAMS } from '../lib/room.js';
import { CATEGORIES } from './trivia.js';
import { NUMERIC } from './numeric.js';
import { FINALS } from './finals.js';
import { FAKEOUT } from './fakeout.js';
import { PLACES } from './places.js';

export const LINES = {
  // ---------- lobby / start ----------
  lobbyFirst: [
    "Ooh, our first contestant! Make yourself at home.",
    "A contestant! Brilliant. The show can begin. Well, almost.",
    "Hello, hello! Somebody's keen. I like that."
  ],
  lobbyJoin: [
    "Another brain joins the brawl!",
    "Welcome aboard! Mind the gap.",
    "Ooh, fresh competition!",
    "The more the merrier. And the louder.",
    "Another contestant! Lovely stuff."
  ],
  teamDraw: [
    "Team time! Grab your phones and draw your team picture. Together. Nicely.",
    "Right, teams! Draw your mascot. No pressure, it only represents you forever.",
    "Artists, assemble! Draw your team picture. Quickly now!"
  ],
  welcome: [
    "Good evening, and welcome to Brain Brawl! Where brains go to brawl. It's in the name!",
    "Hello, hello, hello! Welcome to Brain Brawl! I'm your host, Lewis, and I've been polished for the occasion.",
    "Ladies and gentlemen, and that one friend who always argues with the answers. Welcome to Brain Brawl!",
    "Welcome to Brain Brawl! Phones out, thinking caps on, biscuits within reach.",
    "It's showtime! Welcome to Brain Brawl, the only show where being a know-it-all is finally a good thing!"
  ],
  intro_board: [
    "This is Brain Board! Pick a tile, buzz in first, and don't embarrass yourselves.",
    "Brain Board, everybody! Fastest finger wins. Wrong answers cost you, so think. A bit."
  ],
  intro_wedge: [
    "Wedge Rush! Spin the wheel, answer fast, and fill your pie. Mmm, pie.",
    "It's Wedge Rush! Everyone answers at once. First to fill their pie wins!"
  ],
  intro_fakeout: [
    "Fake Out! Write a convincing lie, then spot the truth. Your mum would be so proud.",
    "It's Fake Out! The game where lying is not only allowed, it's encouraged!"
  ],
  intro_doodle: [
    "Doodle Dash! One of you draws, the rest of you guess. Artistic talent entirely optional.",
    "It's Doodle Dash! Grab your phones. Picasso would be terrified. Or confused."
  ],
  intro_pindrop: [
    "Pin Drop! Look at the photo and stick a pin where you think it is. Geography teachers, this is your moment.",
    "It's Pin Drop! Where in the world are we? Drop your pin and find out!"
  ],

  // ---------- Brain Board ----------
  pick: [
    "Pick a tile, any tile!",
    "Your turn to choose. Choose wisely.",
    "What'll it be? The board is yours.",
    "Go on then, pick something. I'm on the edge of my seat."
  ],
  pickTeam: [
    "{team}, the board is yours!",
    "Over to you, {team}. Pick a tile!",
    "{team}, what are we feeling?"
  ],
  buzz: [
    "We have a buzz!",
    "Quick on the button!",
    "Ooh, somebody's confident!",
    "Speedy fingers!",
    "Buzz! Let's hear it!"
  ],
  buzzTeam: [
    "{team} buzz in!",
    "It's the {team}!",
    "{team}, quick as a flash!"
  ],
  wrong: [
    "Ooh, no. So close. Well, not that close.",
    "Nope! But I admire the confidence.",
    "Wrong! But you said it so beautifully.",
    "Oh no. Oh no no no. That's a no.",
    "Incorrect! Your brain called. It wants a refund.",
    "Not quite! Points for style, though. Not actual points.",
    "Ouch. That one's going in the blooper reel."
  ],
  correct: [
    "Correct! You absolute genius.",
    "That's right! Somebody give that brain a gold star.",
    "Yes! Big brain energy!",
    "Correct! Cooking with gas now!",
    "Spot on! Your mum would be proud.",
    "Ding ding ding! Brilliant!"
  ],
  correctTeam: [
    "Correct! Well done, {team}!",
    "That's right! The {team} are on fire!",
    "Spot on, {team}! Lovely stuff."
  ],
  nobody: [
    "Nobody got it? Shocking. Absolutely shocking.",
    "Well, that went well. The answer's on the screen.",
    "Not a single correct answer. I'm not angry, I'm just disappointed.",
    "Oh dear, oh dear. Let's never speak of this again."
  ],
  timeUp: [
    "Time's up! Too scared to buzz?",
    "Crickets! Not one brave soul.",
    "Nobody buzzed! I'll pretend that was a tactical decision.",
    "Silence! The answer's on the screen. Write it down."
  ],
  finalBet: [
    "It's the final round! Place your bets. Go big, or go home. Well, you're probably already home.",
    "Final round! This is where legends are made. And friendships are tested. Place your bets!",
    "Here we go, the final question! How much do you trust that brain of yours? Place your bets!"
  ],
  finalReveal: [
    "Let's see who's a genius, and who's just gambled it all away.",
    "Moment of truth! Drum roll, please.",
    "Right, let's reveal those answers. I can hardly look."
  ],

  // ---------- Wedge Rush ----------
  spin: [
    "Round and round she goes!",
    "Spin that wheel!",
    "Where she stops, nobody knows!",
    "Wheee! Sorry. I love this bit."
  ],
  numeric: [
    "Closest number wins!",
    "This one's a number. Closest guess takes it!"
  ],
  wedgeWin: [
    "That's a wedge! Pie is getting fuller.",
    "Wedge grabbed! Lovely.",
    "Another slice of pie! Delicious.",
    "Wedge! Somebody's hungry."
  ],
  wedgeWinTeam: [
    "{team} grab the wedge!",
    "That wedge goes to the {team}!"
  ],
  wedgeNone: [
    "No wedge this time! The pie remains hungry.",
    "Nobody gets the wedge. Tragic.",
    "No pie for anyone. Back to the wheel!"
  ],

  // ---------- Fake Out ----------
  lie: [
    "Now write a fake answer. Make it convincing!",
    "Time to lie through your teeth! Write something believable.",
    "Write a fake answer. Fool your friends. It's fine, it's a game.",
    "Get those lies in! The sneakier, the better."
  ],
  fakePick: [
    "Now, which one's the truth? Choose carefully!",
    "Find the real answer. Trust no one!",
    "Somewhere in there is the truth. Good luck!",
    "Pick the truth. Don't get fooled!"
  ],
  truth: [
    "And that's the truth!",
    "That's the real answer! Weird, isn't it?",
    "Believe it or not, that one's true!",
    "The truth! Stranger than fiction."
  ],
  fooled: [
    "Fooled you! That was a lie!",
    "Ha! Somebody made that up!",
    "Bamboozled! Totally fake!",
    "That's a lie! Shame on you. Well done, though.",
    "Hoodwinked! What a beautiful lie."
  ],

  // ---------- Doodle Dash ----------
  doodleChoose: [
    "Our artist is choosing a word. No peeking!",
    "Artist, pick your word. Everyone else, look away. Well, you can look at the telly.",
    "A new artist steps up! Choose a word."
  ],
  doodleGo: [
    "Start drawing! Everyone else, start guessing!",
    "Pens at the ready. Go!",
    "Let's see what we've got. Draw!",
    "Off you go! Draw like nobody's watching. Everybody's watching."
  ],
  doodleGot: [
    "Somebody got it!",
    "Ooh, we have a winner!",
    "Got it! Clever clogs."
  ],
  doodleNobody: [
    "Nobody got it! Was it modern art?",
    "No one guessed it. Our artist is clearly ahead of their time.",
    "Not a single guess! I blame the artist. Lovingly."
  ],
  doodleReveal: [
    "Well drawn! Sort of.",
    "A masterpiece! Hang it in a gallery. A small one.",
    "Lovely! Let's see the next one."
  ],

  // ---------- Pin Drop ----------
  pinGo: [
    "Where in the world is this? Drop your pin!",
    "Take a good look. Where are we?",
    "Ooh, I know this one. I'm not telling. Drop your pins!",
    "Get your pins out. Where on Earth is this?"
  ],
  pinDouble: [
    "Last photo, and it's worth double points! Pin carefully!",
    "Final photo! Double points! Concentrate!"
  ],
  pinBullseye: [
    "Bullseye! Spot on!",
    "Bang on the money! Bullseye!",
    "Bullseye! Have you been there?"
  ],
  pinReveal: [
    "Let's see how close you got.",
    "Here's where it really is!",
    "And the pins are in. Let's have a look."
  ],

  // ---------- any mode ----------
  hurry: [
    "Five seconds!",
    "Tick tock! Hurry up!",
    "Quickly now!",
    "Come on, come on!",
    "Hurry, the clock is hungry!"
  ],
  winner: [
    "And the winner is... take a bow, you magnificent brain!",
    "We have a champion! Somebody frame this moment!",
    "Congratulations! You are officially the biggest brain in the room!",
    "And that's the game! Our winner takes the crown!"
  ],
  winnerTeam: [
    "And the winners are... the {team}! Take a bow!",
    "The {team} win! Absolutely magnificent!"
  ],
  tie: [
    "It's a tie! I couldn't have scripted it better. Well, I could, but I didn't.",
    "A draw! Everybody wins! Except everybody else."
  ]
};

/* ---------- spoken text and ids (shared with the voice generator) ---------- */

/** The text Lewis actually says for a line or question. */
export function spoken(text) {
  return String(text || '')
    .replace(/_{2,}/g, 'blank')
    .replace(/[\p{Extended_Pictographic}️‍]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 64-bit FNV-1a (as two 32-bit halves): a short, stable file name for each line.
export function voiceId(text) {
  const s = spoken(text);
  let a = 0x811c9dc5, b = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b ^ c, 0x5bd1e995) ^ (b >>> 15);
  }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
}

export const teamLine = (text, team) => text.replace(/\{team\}/g, team);
export const placeLine = (p) => `${p.name}! ${p.where}.`;

/** Every piece of text Lewis may say, for the voice generator. */
export function allSpokenLines() {
  const out = new Set();
  const teamNames = Object.values(TEAMS).map((t) => t.name);
  for (const pool of Object.values(LINES)) {
    for (const l of pool) {
      if (l.includes('{team}')) teamNames.forEach((n) => out.add(teamLine(l, n)));
      else out.add(l);
    }
  }
  for (const c of CATEGORIES) c.questions.forEach((q) => out.add(q.q));
  for (const list of Object.values(NUMERIC)) list.forEach((q) => out.add(q.q));
  FINALS.forEach((q) => out.add(q.q));
  FAKEOUT.forEach((p) => out.add(p.text));
  PLACES.forEach((p) => out.add(placeLine(p)));
  return [...out].map((t) => spoken(t)).filter(Boolean);
}

/* ---------- picking lines ---------- */

const used = new Map();

/** A random line of this kind (no repeats until the pool runs out). team: team name for {team} lines. */
export function line(kind, team = null) {
  const pool = LINES[kind];
  if (!pool?.length) return '';
  let left = used.get(kind);
  if (!left || !left.length) {
    left = pool.map((_, i) => i);
    used.set(kind, left);
  }
  const i = left.splice(Math.floor(Math.random() * left.length), 1)[0];
  return team ? teamLine(pool[i], team) : pool[i];
}
