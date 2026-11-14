// Lists every line Lewis can say (jokes, questions, places) into tools/voice/lines.json,
// with the file id the game uses to find each audio clip.
// Run: node tools/voice/export-lines.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { allSpokenLines, voiceId } from '../../src/content/presenter.js';

const lines = allSpokenLines().map((text) => ({ id: voiceId(text), text }));
const ids = new Set(lines.map((l) => l.id));
if (ids.size !== lines.length) throw new Error('Two lines got the same id. Change voiceId().');

const out = fileURLToPath(new URL('./lines.json', import.meta.url));
writeFileSync(out, JSON.stringify(lines, null, 1) + '\n');
console.log(`${lines.length} lines -> tools/voice/lines.json`);
