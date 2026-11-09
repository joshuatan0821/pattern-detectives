// Game state, settings, save slots, achievements, and playtest stats.
// Saved in localStorage: "pd-global" holds settings, achievements and stats; "pd-slot-N" holds each save.
export const SLOTS = 3;
export const settings = { speed: "normal", vol: 0.6, muted: false, bigText: false, confirm: true };
export const S = { mode: "page", path: [] };

const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const G = { achievements: [], goldHat: false, stats: {}, ...read("pd-global") };
Object.assign(settings, G.settings);
export const saveGlobal = () => write("pd-global", { ...G, settings });

const SAVED = ["name", "badges", "results", "map", "px", "py", "dir", "potions", "facts", "signsRead", "flags",
  "rivalWins", "wildWins", "blackouts", "playMs"];
export function freshRun(name = null, slot = null) {
  Object.assign(S, { slot, name, badges: 0, results: {}, map: "lab", px: 8, py: 5, dir: "up", potions: 1, facts: [],
    signsRead: [], flags: {}, rivalWins: 0, wildWins: 0, blackouts: 0, playMs: 0, streak: 0, mv: null, path: [],
    stepN: 0, wildCool: 3, busy: false });
}
export function saveSlot() {
  if (S.slot == null) return; // demo runs aren't saved
  const d = { savedAt: Date.now() };
  for (const k of SAVED) d[k] = S[k];
  write(`pd-slot-${S.slot}`, d);
}
export const readSlot = (i) => read(`pd-slot-${i}`);
export function loadSlot(i) { const d = readSlot(i); freshRun(d.name, i); Object.assign(S, d); }
export const clearSlot = (i) => { try { localStorage.removeItem(`pd-slot-${i}`); } catch {} };

// A Step counts as beaten once it's recorded, or once its whole Level's badge is earned.
export const beaten = (level, step) => `${level}-${step}` in S.results || level < S.badges;

let unlockHandler = () => {};
export const onUnlock = (f) => (unlockHandler = f);
export function unlock(id) { // achievements are kept across runs and slots
  if (G.achievements.includes(id)) return;
  G.achievements.push(id); saveGlobal(); unlockHandler(id);
}

// Playtest stats for the progress report: plays, first tries, time to solve, and which wrong Options get picked.
export function stat(key, fn) {
  const s = (G.stats[key] ||= { plays: 0, firstTry: 0, wrong: {}, ms: [] });
  fn(s); saveGlobal();
}
export const resetStats = () => { G.stats = {}; saveGlobal(); };
