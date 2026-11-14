// Tiny database layer with two backends:
//  - Firebase Realtime Database (real games, phones over the internet)
//  - Local test mode (tabs in one browser, via localStorage + BroadcastChannel)
// Paths look like "rooms/ABCD/state".

import { firebaseConfig } from '../firebase-config.js';

export const isLocal = !firebaseConfig || !firebaseConfig.databaseURL;

let backendPromise = null;
export function getDb() {
  if (!backendPromise) backendPromise = isLocal ? Promise.resolve(localBackend()) : firebaseBackend();
  return backendPromise;
}

/* ---------------- Firebase ---------------- */

async function firebaseBackend() {
  const { initializeApp } = await import('firebase/app');
  const fb = await import('firebase/database');
  const app = initializeApp(firebaseConfig);
  const db = fb.getDatabase(app);
  const r = (p) => fb.ref(db, p);

  let offset = 0;
  fb.onValue(r('.info/serverTimeOffset'), (s) => (offset = s.val() || 0));

  return {
    get: async (p) => (await fb.get(r(p))).val(),
    set: (p, v) => fb.set(r(p), v),
    update: (p, v) => fb.update(r(p), v),
    remove: (p) => fb.remove(r(p)),
    push: (p, v) => fb.push(r(p), v),
    serverTime: () => fb.serverTimestamp(),
    now: () => Date.now() + offset,
    onValue: (p, cb) => fb.onValue(r(p), (s) => cb(s.val())),
    onChildAdded: (p, cb) => fb.onChildAdded(r(p), (s) => cb(s.key, s.val())),
    removeOnDisconnect: (p) => fb.onDisconnect(r(p)).remove(),
    onConnection: (cb) => fb.onValue(r('.info/connected'), (s) => cb(!!s.val()))
  };
}

/* ---------------- Local test mode ---------------- */

const LS_KEY = 'bb-local-db';

function localBackend() {
  const chan = new BroadcastChannel('bb-local-db');
  const listeners = new Set();

  const read = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
  };
  const write = (tree) => {
    localStorage.setItem(LS_KEY, JSON.stringify(tree));
    chan.postMessage('changed');
    notify();
  };
  const parts = (p) => p.split('/').filter(Boolean);
  const getAt = (tree, p) => parts(p).reduce((n, k) => (n == null ? undefined : n[k]), tree) ?? null;
  const setAt = (tree, p, v) => {
    const ks = parts(p);
    let n = tree;
    for (let i = 0; i < ks.length - 1; i++) {
      if (typeof n[ks[i]] !== 'object' || n[ks[i]] === null) n[ks[i]] = {};
      n = n[ks[i]];
    }
    const last = ks[ks.length - 1];
    if (v === null || v === undefined) delete n[last];
    else {
      const pruned = prune(JSON.parse(JSON.stringify(v)));
      if (pruned === undefined) delete n[last];
      else n[last] = pruned;
    }
  };
  // Like Firebase: empty objects, empty arrays and nulls are not stored.
  const prune = (v) => {
    if (v === null) return undefined;
    if (typeof v !== 'object') return v;
    const out = {};
    for (const [k, x] of Object.entries(v)) {
      const p = prune(x);
      if (p !== undefined) out[k] = p;
    }
    if (!Object.keys(out).length) return undefined;
    return Array.isArray(v) && Object.keys(out).every((k, i) => String(i) === k) ? Object.values(out) : out;
  };
  const notify = () => listeners.forEach((l) => l());
  chan.onmessage = notify;
  // Other tabs changing localStorage also fire a "storage" event.
  window.addEventListener('storage', (e) => { if (e.key === LS_KEY) notify(); });

  let pushCount = 0;

  return {
    get: async (p) => getAt(read(), p),
    set: async (p, v) => { const t = read(); setAt(t, p, v); write(t); },
    update: async (p, obj) => {
      const t = read();
      for (const [k, v] of Object.entries(obj)) setAt(t, `${p}/${k}`, v);
      write(t);
    },
    remove: async (p) => { const t = read(); setAt(t, p, null); write(t); },
    push: async (p, v) => {
      const key = `${Date.now().toString(36)}${(pushCount++).toString(36).padStart(3, '0')}${Math.random().toString(36).slice(2, 6)}`;
      const t = read();
      setAt(t, `${p}/${key}`, v);
      write(t);
    },
    serverTime: () => Date.now(),
    now: () => Date.now(),
    onValue: (p, cb) => {
      let last;
      const run = () => {
        const v = getAt(read(), p);
        const s = JSON.stringify(v);
        if (s !== last) { last = s; cb(v); }
      };
      listeners.add(run);
      run();
      return () => listeners.delete(run);
    },
    onChildAdded: (p, cb) => {
      const seen = new Set();
      const run = () => {
        const v = getAt(read(), p) || {};
        for (const k of Object.keys(v).sort()) {
          if (!seen.has(k)) { seen.add(k); cb(k, v[k]); }
        }
      };
      listeners.add(run);
      run();
      return () => listeners.delete(run);
    },
    removeOnDisconnect: () => {},
    onConnection: (cb) => { cb(true); return () => {}; }
  };
}
