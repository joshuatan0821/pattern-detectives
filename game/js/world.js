// The overworld: drawing maps, walking (keys or click/tap), doors, people, sight lines, hidden notes, and wild patterns.
import { S, saveSlot, unlock, beaten } from "./state.js";
import { MAPS, PEOPLE, FACTS, LEVELS, BADGES, TALK, STORE_LINES, JEEP_LINES, SIGN_COUNT, HOME, playerLook } from "./content.js";
import { TILE, drawTile, drawPerson, drawShadow, drawBang, drawLock, drawStar, drawLab, drawStore, drawJeep } from "./draw.js";
import { SFX } from "./audio.js";
import { say, boxOpen, fade, toast } from "./ui.js";
import { studentBattle, rivalBattle, wildBattle, finalBattle } from "./battle.js";

const mapEl = document.querySelector("#map"), hudText = document.querySelector("#hud .where");
const STEP_MS = 160;
export const FACING = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const WALK = new Set([".", ",", "=", "q", "O", "R", "E"]);

const tileAt = (map, x, y) => MAPS[map].rows[y]?.[x] ?? "T";
const rivalHere = () => S.rivalWins < Math.min(S.badges, 3); // Jamie shows up once after each badge
const peopleOn = (map) => PEOPLE.filter((p) => p.map === map && (p.id !== "rival" || rivalHere()));
const personAt = (x, y) => peopleOn(S.map).find((p) => p.x === x && p.y === y);
const warpAt = (x, y) => MAPS[S.map].warps[`${x},${y}`];
const walkable = (x, y) => WALK.has(tileAt(S.map, x, y)) && !personAt(x, y) && !warpAt(x, y);

// ---------- drawing ----------
export function drawMapTo(c, mapId, time = 0) {
  const m = MAPS[mapId];
  m.rows.forEach((row, y) => [...row].forEach((t, x) => {
    drawTile(c, t, x * TILE, y * TILE, m.pal, x, y, (dx, dy) => m.rows[y + dy]?.[x + dx] ?? "T", time);
    const w = m.warps[`${x},${y}`];
    if (w && w.level != null) { if (w.level > S.badges) drawLock(c, x * TILE, y * TILE); else if (w.level < S.badges) drawStar(c, x * TILE, y * TILE); }
  }));
  if (mapId === "town") { drawLab(c, 4 * TILE, 6 * TILE); drawStore(c, 1 * TILE, 6 * TILE); drawJeep(c, 11 * TILE, 5 * TILE); }
  for (const p of peopleOn(mapId)) {
    drawShadow(c, p.x * TILE, p.y * TILE);
    drawPerson(c, p.x * TILE, p.y * TILE, p.look, 0, p.face);
    if (p.student && beaten(p.student.level, p.student.step)) drawStar(c, p.x * TILE, p.y * TILE - 1);
  }
  if (m.level != null && m.level >= S.badges) { c.fillStyle = "rgba(70,60,90,.18)"; c.fillRect(0, 0, 240, 160); } // scrambled until restored
}
function drawMap(now) {
  const c = mapEl.getContext("2d");
  drawMapTo(c, S.map, now);
  const look = playerLook();
  if (look) { // slide between tiles, lifting a leg for the first part of each step
    let x = S.px, y = S.py, frame = 0;
    if (S.mv) { const p = Math.min(1, (now - S.mv.t0) / STEP_MS); x = S.mv.fx + (S.px - S.mv.fx) * p; y = S.mv.fy + (S.py - S.mv.fy) * p; frame = p < 0.6 ? 1 + (S.stepN % 2) : 0; }
    drawShadow(c, Math.round(x * TILE), Math.round(y * TILE));
    drawPerson(c, Math.round(x * TILE), Math.round(y * TILE), look, frame, S.dir);
  }
  if (S.bang) drawBang(c, S.bang.x * TILE, S.bang.y * TILE);
  hudText.textContent = `${MAPS[S.map].name} · Badges ${BADGES.map((_, i) => (i < S.badges ? "●" : "○")).join("")}`;
}
export function startWorld() {
  const frame = (now) => { if (S.mode === "map") drawMap(now); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
  let last = performance.now();
  setInterval(() => { // game logic runs on a timer so it keeps going even when the tab isn't painting
    const now = performance.now();
    if (S.name && (S.mode === "map" || S.mode === "battle")) S.playMs += now - last;
    last = now;
    if (S.mode !== "map") return;
    if (S.mv && now - S.mv.t0 >= STEP_MS) { S.mv = null; arrived(); }
    if (!S.mv && S.path.length && !boxOpen() && !S.busy) move(...S.path.shift());
  }, 40);
}

// ---------- moving ----------
export function move(dx, dy) {
  if (S.mode !== "map" || S.busy || !S.name || boxOpen()) return;
  const now = performance.now();
  if (S.mv) { if (now - S.mv.t0 < STEP_MS) return; S.mv = null; if (arrived()) return; } // finish the last step first
  S.dir = dx ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
  const nx = S.px + dx, ny = S.py + dy, key = `${nx},${ny}`, t = tileAt(S.map, nx, ny);
  const p = personAt(nx, ny), w = warpAt(nx, ny), sign = MAPS[S.map].signs[key];
  if (p || w || sign || t === "X" || t === "J") S.path = [];
  if (p) return talkTo(p);
  if (w) return useWarp(w);
  if (sign) return readSign(key, sign);
  if (t === "X") return store();
  if (t === "J") return say(JEEP_LINES);
  if (!walkable(nx, ny)) { S.path = []; return SFX.bump(); }
  S.mv = { fx: S.px, fy: S.py, t0: now }; S.stepN++; S.px = nx; S.py = ny;
}
export const act = () => move(...FACING[S.dir]); // the A button: walk or talk in the direction you face
function arrived() { // returns true when arriving set something off, so a queued walk stops
  const fact = FACTS.find((f) => f.map === S.map && f.x === S.px && f.y === S.py && !S.facts.includes(f.id));
  if (fact) { S.path = []; findFact(fact); return true; }
  if (spot()) return true;
  if (tileAt(S.map, S.px, S.py) === "," && --S.wildCool <= 0 && Math.random() < 0.15) {
    S.wildCool = 4; S.path = [];
    const lv = MAPS[S.map].level ?? Math.floor(Math.random() * (Math.min(S.badges, 2) + 1));
    wildBattle(lv); return true;
  }
  return false;
}
export function goTo(spot) { Object.assign(S, { map: spot.map, px: spot.x, py: spot.y, dir: spot.dir, mv: null, path: [] }); }
export function goHome() { S.busy = true; fade(() => { goTo(HOME); S.busy = false; saveSlot(); }); }

// ---------- people and things ----------
const ready = (p) => (p.student ? !beaten(p.student.level, p.student.step) && p.student.level <= S.badges : p.id === "rival");
function spot() { // a student or Jamie who sees you along their line of sight walks over for a battle
  for (const p of peopleOn(S.map)) {
    if (!p.sight || !ready(p)) continue;
    const [dx, dy] = FACING[p.face];
    for (let d = 1; d <= p.sight; d++) {
      const x = p.x + dx * d, y = p.y + dy * d;
      if (x === S.px && y === S.py) { spotted(p); return true; }
      if (!WALK.has(tileAt(S.map, x, y))) break;
    }
  }
  return false;
}
function spotted(p) {
  S.path = []; S.busy = true; S.bang = p; SFX.spotted();
  S.dir = { up: "down", down: "up", left: "right", right: "left" }[p.face];
  setTimeout(() => { S.bang = null; S.busy = false; talkTo(p); }, 700);
}
function talkTo(p) {
  if (p.student) {
    const s = p.student;
    if (beaten(s.level, s.step)) return say([`STUDENT ${s.name}: ${s.lose}`]);
    return studentBattle(p);
  }
  if (p.id === "rival") return rivalBattle();
  if (p.id === "durwin") {
    if (S.badges < 3) return say(TALK.durwin[S.badges]);
    if ("3-0" in S.results) return say(["SIR DURWIN: Your notebook is complete. Splendid work!"]);
    return finalBattle();
  }
  say(TALK[p.id][Math.min(S.badges, 3)]);
}
function useWarp(w) {
  if (w.level != null && w.level > S.badges) { SFX.bump(); return say([`The way to ${LEVELS[w.level].name} is blocked. Earn the ${BADGES[w.level - 1]} first.`]); }
  S.busy = true; SFX.door();
  fade(() => {
    goTo({ map: w.to, x: w.x, y: w.y, dir: w.dir }); S.busy = false; saveSlot();
    const lv = MAPS[w.to].level;
    if (lv != null && lv >= S.badges && !S.flags[`seen${lv}`]) {
      S.flags[`seen${lv}`] = true;
      say([`${LEVELS[lv].name}... the patterns here look scrambled!`, "Win both student battles to put them back in order."]);
    }
  });
}
function readSign(key, text) {
  const id = `${S.map}:${key}`;
  if (!S.signsRead.includes(id)) { S.signsRead.push(id); if (S.signsRead.length >= SIGN_COUNT) unlock("reader"); }
  say([`SIGN: ${text}`]);
}
function store() {
  if (S.flags.store) return say(STORE_LINES.later);
  S.flags.store = true; S.potions++; saveSlot();
  say(STORE_LINES.first, () => toast("Got a HINT POTION"));
}
function findFact(f) {
  S.facts.push(f.id); S.potions++; SFX.find(); saveSlot();
  if (S.facts.length === FACTS.length) unlock("explorer");
  say(["You found a note hidden in the grass!", `NOTE: ${f.text}`, "You also found a HINT POTION. The note is saved in your Field Notebook."]);
}

// ---------- click or tap to walk ----------
export function clickMap(ev) {
  if (S.mode !== "map" || S.busy || !S.name || boxOpen()) return;
  const r = mapEl.getBoundingClientRect();
  const tx = Math.floor(((ev.clientX - r.left) / r.width) * 15), ty = Math.floor(((ev.clientY - r.top) / r.height) * 10);
  S.path = findPath(tx, ty) || [];
}
function findPath(tx, ty) { // breadth-first search; a target you can't stand on (a person, sign, door) ends with a step into it
  if (tx === S.px && ty === S.py) return [];
  const prev = new Map([[`${S.px},${S.py}`, null]]), queue = [[S.px, S.py]];
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of Object.values(FACING)) {
      const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
      if (prev.has(k)) continue;
      if (nx === tx && ny === ty) { prev.set(k, [x, y, dx, dy]); return trace(prev, k); }
      if (!walkable(nx, ny)) continue;
      prev.set(k, [x, y, dx, dy]); queue.push([nx, ny]);
    }
  }
  return null;
}
function trace(prev, k) {
  const steps = [];
  for (let p = prev.get(k); p; p = prev.get(`${p[0]},${p[1]}`)) steps.unshift([p[2], p[3]]);
  return steps;
}
