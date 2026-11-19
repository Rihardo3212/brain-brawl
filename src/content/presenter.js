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
import { CLOSEST } from './closest.js';
import { PROMPTS } from './whowrote.js';

export const LINES = {
  // ---------- lobby / start ----------
  lobbyFirst: [
    "Ooh, our first contestant! Make yourself at home.",
    "A contestant! Brilliant. The show can begin. Well, almost.",
    "Hello, hello! Somebody's keen. I like that."
  ],
  lobbyJoin: [
    "Another challenger enters the pit!",
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
    "Good evening, and welcome to Party Pit! Where friendships go to be tested. Lovingly.",
    "Hello, hello, hello! Welcome to Party Pit! I'm your host, Lewis, and I've been polished for the occasion.",
    "Ladies and gentlemen, and that one friend who always argues with the answers. Welcome to Party Pit!",
    "Welcome to Party Pit! Phones out, thinking caps on, biscuits within reach.",
    "It's showtime! Welcome to Party Pit, the only show where showing off is finally a good thing!"
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
  intro_tour: [
    "This is Party Tour! Roll the dice, move around the board, and win mini games along the way.",
    "Party Tour! A board game made of mini games. Roll well, play better."
  ],
  intro_closest: [
    "This is Closest Call! Guess the number. Closest guess wins the points.",
    "Closest Call! You don't have to know the answer. Just be closer than your mates."
  ],
  intro_timeline: [
    "This is Timeline! Put the events in order, oldest first. Fast and right wins big.",
    "Timeline! Which came first? Sort it out, quick as you can."
  ],
  intro_whowrote: [
    "This is Who Wrote That! Answer a fun question, then guess who wrote what.",
    "Who Wrote That! How well do you really know your friends? Let's find out."
  ],
  intro_oddone: [
    "This is Odd One Out! Everyone gets a secret word, except the spy. Find the spy!",
    "Odd One Out! One of you is a spy. Give clues, then vote them out."
  ],
  intro_scribble: [
    "This is Scribble Chain! Write it, draw it, guess it, pass it on. Chaos guaranteed.",
    "Scribble Chain! Like the telephone game, but with terrible drawings."
  ],
  intro_sketch: [
    "This is Memory Sketch! Look at the drawing, then draw it from memory.",
    "Memory Sketch! A quick look, then copy it. The closer the better."
  ],
  intro_reflex: [
    "This is Reflex Rumble! Quick little challenges. Fingers at the ready!",
    "Reflex Rumble! Tap, mash and shake your way to glory."
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
  // ---------- Closest Call ----------
  closeGo: [
    "Type your best guess. Closest wins!",
    "Numbers on your phones, please. Close counts here!",
    "No need to be right. Just be less wrong than everyone else."
  ],
  closeDouble: [
    "Last one, and it counts double! Guess wisely.",
    "Final question, double points! This is where legends are made."
  ],
  closeSpot: [
    "Spot on! Are you a calculator in disguise?",
    "Bang on the money! I'm genuinely impressed. And slightly scared."
  ],
  closeReveal: [
    "Let's see who got closest!",
    "And the real answer is...",
    "Right, line them up. Who's nearest?"
  ],

  // ---------- Timeline ----------
  lineGo: [
    "Put them in order, oldest first!",
    "History time! Which came first?",
    "Sort them out, from long ago to not so long ago."
  ],
  linePerfect: [
    "A perfect timeline! Somebody paid attention in history class.",
    "Flawless! You must own a time machine."
  ],
  lineReveal: [
    "Let's see the real order!",
    "And here's how history actually went...",
    "Drumroll for the history books!"
  ],

  // ---------- Who Wrote That? ----------
  whoWrite: [
    "Write your answer! Be honest. Or don't. I won't tell.",
    "Answers on your phones, please. Disguise your style if you're sneaky!",
    "Time to write! Remember, your friends are watching. Well, guessing."
  ],
  whoGuess: [
    "Who wrote that? Look around the room. Somebody's blushing.",
    "Hmm, who would write something like that?",
    "Whose answer is this? Choose wisely!"
  ],
  whoRight: [
    "Rumbled! You know your friends too well.",
    "Caught red handed!",
    "No secrets in this room, apparently."
  ],
  whoFooled: [
    "Nobody guessed it! What a master of disguise.",
    "Fooled the lot of you! Bravo, you sneaky thing."
  ],

  // ---------- Odd One Out ----------
  oddClue: [
    "There's a spy among us! Everyone else, give a clue. One word. Not too obvious!",
    "One of you doesn't know the word. Type your clue, and act natural.",
    "Shh! The spy is listening. One word clues, please."
  ],
  oddVote: [
    "Right, who's the spy? Vote now!",
    "Look at those clues. Somebody's bluffing. Who is it?",
    "Point the finger! Who's the odd one out?"
  ],
  oddCaught: [
    "Caught you! But wait, the spy gets one guess at the word.",
    "Gotcha, spy! Now, can you guess the secret word?"
  ],
  oddEscaped: [
    "The spy got away! Nobody suspected a thing.",
    "Wrong person! The real spy is having a lovely evening.",
    "Sneaky, sneaky! The spy escapes!"
  ],
  oddWin: [
    "Spy caught! Well done, detectives.",
    "Justice is served! Points for the honest folk."
  ],
  oddStole: [
    "Caught, but they guessed the word! Cheeky!",
    "The spy knew it all along! Well played."
  ],

  // ---------- Scribble Chain ----------
  scWrite: [
    "Write something silly for the next person to draw!",
    "Prompts, please! The sillier the better.",
    "Write a little idea. Your friends will ruin it beautifully."
  ],
  scDraw: [
    "Now draw what you got! No letters, no cheating.",
    "Artists, it's your moment. Draw!",
    "Draw it! It doesn't have to be good. It really doesn't."
  ],
  scDesc: [
    "What on earth is that? Describe the drawing!",
    "Look at that masterpiece. What is it?",
    "Guess the drawing! Be kind. Or honest."
  ],
  scShow: [
    "Let's see how that chain turned out!",
    "Here comes the chain! Brace yourselves.",
    "Watch carefully. This is where it all goes wrong."
  ],
  scVote: [
    "Vote for your favorite step!",
    "Which bit was the best? Vote now!"
  ],

  // ---------- Memory Sketch ----------
  memLook: [
    "Look closely! You'll draw it from memory.",
    "Eyes on the screen! Remember every line.",
    "Memorise this! It won't stay long."
  ],
  memDraw: [
    "Now draw it from memory! Go!",
    "Gone! Draw what you remember.",
    "Pens out! How good is your memory?"
  ],
  memGreat: [
    "Wow, a photographic memory!",
    "Brilliant copies! I'm impressed."
  ],
  memReveal: [
    "Let's compare! Hmm. Interesting choices.",
    "Here are your drawings. Some of them are... art.",
    "And how close did you get?"
  ],

  // ---------- Reflex Rumble ----------
  reflex_green: [
    "Wait for green, then tap! Too early and you're out.",
    "Fingers ready! Tap the moment it turns green."
  ],
  reflex_mash: [
    "Mash that button! As fast as you can!",
    "Tapping time! Go wild!"
  ],
  reflex_stop5: [
    "Stop the clock at exactly five seconds. Count in your head!",
    "Five seconds. No peeking at the clock!"
  ],
  reflex_shake: [
    "Shake your phone! Hold on tight!",
    "Shake it like you mean it! Not too hard."
  ],
  reflexWin: [
    "Lightning fast!",
    "What reflexes! Are you even human?",
    "And we have a winner!"
  ],

  // ---------- Party Tour ----------
  tourRoll: [
    "Dice at the ready! Everybody roll!",
    "Roll the dice! Let's see where fate takes you.",
    "Phones out, and roll!"
  ],
  tourBonus: [
    "A bonus space! Lucky you!",
    "Ooh, free points! Don't spend them all at once."
  ],
  tourTrap: [
    "Oh dear, a trap! That's going to sting.",
    "Ouch! Mind your step next time."
  ],
  tourLap: [
    "Round the board you go! Lap bonus!",
    "Another lap! Have some points for the journey."
  ],
  tourPick_closest: ["Next up, Closest Call! Get your guessing hats on."],
  tourPick_timeline: ["Next up, Timeline! Put history in order."],
  tourPick_pindrop: ["Next up, Pin Drop! Where in the world are we?"],
  tourPick_reflex: ["Next up, Reflex Rumble! Fingers ready!"],
  tourPick_sketch: ["Next up, Memory Sketch! Eyes on the screen."],
  tourPick_oddone: ["Next up, Odd One Out! Somebody's a spy."],
  tourPick_wedge: ["Next up, Wedge Rush! Spin that wheel."],
  tourPick_board: ["Next up, Brain Board! Buzzers at the ready."],
  tourScore: [
    "And that round goes to... well, look at the board!",
    "Points on the board! Back to the dice.",
    "Lovely stuff. Back to the tour!"
  ],

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
  CLOSEST.forEach((q) => out.add(q.q));
  PROMPTS.forEach((p) => out.add(p));
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
