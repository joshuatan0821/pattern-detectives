// Screens and text: the dialogue box, title and save slots, the opening scene, menus, the notebook, settings, and endings.
import { S, G, settings, SLOTS, saveGlobal, saveSlot, readSlot, loadSlot, clearSlot, freshRun, resetStats, unlock } from "./state.js";
import { LEVELS, BADGES, CHARS, FACTS, GLOSSARY, ACHIEVEMENTS, ENDING_LINES, INTRO_LINES, MAPS, GOLD_HAT, startLines, totalSteps, stepKey, speakerLook, playerLook } from "./content.js";
import { drawPerson, drawFigure, drawBadge, runAnim, stopAnims, describe } from "./draw.js";
import { SFX, audioOn } from "./audio.js";
import { drawMapTo } from "./world.js";
import { practiceBattle, speedBattle, stars } from "./battle.js";

export const $ = (s) => document.querySelector(s);
const battleEl = $("#battle"), pageEl = $("#page"), box = $("#box"), hud = $("#hud"), fx = $("#fx"), mapEl = $("#map"), overlay = $("#overlay"), toastEl = $("#toast");
const toMap = () => show("map");
const clock = (ms = 0) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;

export function show(mode) {
  S.mode = mode;
  battleEl.hidden = mode !== "battle"; pageEl.hidden = mode !== "page"; hud.hidden = mode !== "map"; mapEl.hidden = mode === "battle";
  if (mode !== "map") overlay.hidden = true;
  if (mode !== "page") stopAnims();
}
export function page(html) { stopAnims(); S.back = null; pageEl.innerHTML = html; show("page"); pageEl.scrollTop = 0; }

// ---------- the dialogue box ----------
const T = { queue: [], after: null, typing: null, full: "", choosing: false };
const SPEEDS = { slow: 45, normal: 22, fast: 8, instant: 0 };
export const boxOpen = () => !box.hidden;
export const isChoosing = () => T.choosing;
export const overlayOpen = () => !overlay.hidden;
export function say(lines, after) {
  if (T.typing) { clearInterval(T.typing); T.typing = null; }
  T.queue = lines.filter(Boolean); T.after = after || null; box.hidden = false; next();
}
export function next() {
  if (T.choosing) return;
  const p = box.querySelector("p");
  if (T.typing) { clearInterval(T.typing); T.typing = null; p.textContent = T.full; return; }
  if (!T.queue.length) { box.hidden = true; face(null); const f = T.after; T.after = null; if (f) f(); return; }
  T.full = T.queue.shift(); face(T.full); p.textContent = "";
  const delay = SPEEDS[settings.speed];
  if (!delay) { p.textContent = T.full; return; }
  let i = 0;
  T.typing = setInterval(() => {
    p.textContent = T.full.slice(0, ++i); if (i % 3 === 0) SFX.blip();
    if (i >= T.full.length) { clearInterval(T.typing); T.typing = null; }
  }, delay);
}
function face(line) { // a portrait of whoever is speaking, from the "NAME:" at the start of the line
  const c = box.querySelector(".face"), m = line && /^([A-Z][A-Z ]*[A-Z]):\s/.exec(line), look = m && speakerLook(m[1]);
  c.hidden = !look;
  if (look) { const ctx = c.getContext("2d"); ctx.clearRect(0, 0, 16, 16); drawPerson(ctx, 0, 0, look); }
}
setInterval(() => { if (S.ffwd && !box.hidden) next(); }, 90); // holding X races through the text
export function choice(text, opts, cb) {
  if (T.typing) { clearInterval(T.typing); T.typing = null; }
  T.choosing = true; box.hidden = false; face(null);
  box.querySelector("p").textContent = text; box.querySelector(".more").hidden = true;
  const row = box.querySelector(".choices");
  row.innerHTML = opts.map((o, i) => `<button data-i="${i}">${o}</button>`).join(""); row.hidden = false;
  row.querySelectorAll("button").forEach((b) => (b.onclick = (e) => {
    e.stopPropagation(); SFX.select();
    row.hidden = true; box.querySelector(".more").hidden = false; box.hidden = true; T.choosing = false; cb(+b.dataset.i);
  }));
  row.querySelector("button").focus();
}
export function choiceKey(k, e) { // arrow keys move between the choices; Enter presses the focused one
  const bs = [...box.querySelectorAll(".choices button")], i = bs.indexOf(document.activeElement);
  if (k === "ArrowLeft" || k === "ArrowRight") { e.preventDefault(); bs[(i + (k === "ArrowRight" ? 1 : bs.length - 1)) % bs.length].focus(); }
}
let toastTimer;
export function toast(text) { toastEl.textContent = text; toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastEl.hidden = true), 2600); }

// ---------- transitions (timers, not animation events, so a background tab can't get stuck) ----------
export function fade(cb) {
  fx.hidden = false; fx.style.background = "#000";
  const a = fx.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, fill: "forwards" });
  setTimeout(() => { cb(); const b = fx.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" }); setTimeout(() => { fx.hidden = true; a.cancel(); b.cancel(); }, 220); }, 220);
}
export function flash(cb) { // white flashes, then black, then the battle fades in
  S.mode = "busy"; fx.hidden = false; SFX.encounter();
  const W = "#fff";
  const a = fx.animate([{ opacity: 0, background: W }, { opacity: 1, background: W }, { opacity: 0, background: W }, { opacity: 1, background: W },
    { opacity: 0, background: W }, { opacity: 1, background: "#000" }], { duration: 700, fill: "forwards" });
  setTimeout(() => {
    cb();
    const b = fx.animate([{ opacity: 1, background: "#000" }, { opacity: 0, background: "#000" }], { duration: 350, fill: "forwards" });
    setTimeout(() => { fx.hidden = true; a.cancel(); b.cancel(); }, 350);
  }, 700);
}

// ---------- title, save slots, and the opening scene ----------
export function updateMute() { $("#mute").textContent = settings.muted ? "Sound off" : "Sound on"; }
export function toggleMute() { settings.muted = !settings.muted; updateMute(); saveGlobal(); }
export function title() {
  document.body.classList.toggle("big", settings.bigText); updateMute();
  const saves = [...Array(SLOTS).keys()].map(readSlot);
  page(`<div class="page title"><canvas class="tsun" width="360" height="180" aria-hidden="true"></canvas><h1>Pattern Detectives</h1>
    <p>A pattern-finding adventure in Barangay Maligaya</p>
    <div class="row"><button id="new">New game</button>${saves.some(Boolean) ? '<button id="cont">Continue</button>' : ""}<button id="speed">Speed battle</button></div>
    <div class="row small"><button id="demo">Demo mode</button><button id="ach">Achievements</button><button id="ctrl">Controls</button><button id="sets">Settings</button><button id="stats">Playtest data</button></div></div>`);
  runAnim(pageEl.querySelector(".tsun"), "title");
  $("#new").onclick = () => { audioOn(); SFX.select(); slots("new"); };
  if ($("#cont")) $("#cont").onclick = () => { audioOn(); SFX.select(); slots("load"); };
  $("#speed").onclick = () => { audioOn(); speedBattle(); };
  $("#demo").onclick = () => { audioOn(); demo(); };
  $("#ach").onclick = () => achievementsPage(title);
  $("#ctrl").onclick = () => controls(title);
  $("#sets").onclick = () => { audioOn(); settingsPage(title); };
  $("#stats").onclick = () => playtestPage(title);
}
function slots(mode) {
  const saves = [...Array(SLOTS).keys()].map(readSlot);
  page(`<div class="page note"><div class="proto">${mode === "new" ? "New game" : "Continue"}</div><h2>Choose a save slot</h2>
    <div class="slots">${saves.map((d, i) => `<button data-i="${i}" ${mode === "load" && !d ? "disabled" : ""}><b>Slot ${i + 1}</b>
      <span>${d ? `${d.name || "–"} · ${d.badges} badge${d.badges === 1 ? "" : "s"} · ${clock(d.playMs)} played` : "Empty"}</span></button>`).join("")}</div>
    <div class="row" style="margin-top:auto"><button id="close">Back</button></div></div>`);
  pageEl.querySelectorAll(".slots button").forEach((b) => (b.onclick = () => {
    const i = +b.dataset.i;
    if (mode === "load") { loadSlot(i); return show("map"); }
    if (!saves[i]) return startNew(i);
    choice(`Slot ${i + 1} already has a saved game. Start over in it?`, ["Start over", "Cancel"], (k) => { if (k === 0) startNew(i); });
  }));
  S.back = title; $("#close").onclick = title;
}
function startNew(slot) { clearSlot(slot); freshRun(null, slot); show("map"); say(INTRO_LINES, chooseChar); }
function chooseChar() {
  overlay.innerHTML = `<div class="chars" role="group" aria-label="Choose your Researcher">${Object.keys(CHARS).map((n) =>
    `<button data-n="${n}"><canvas width="16" height="16" aria-hidden="true"></canvas>${n}</button>`).join("")}</div>`;
  overlay.hidden = false;
  overlay.querySelectorAll("button").forEach((b) => {
    const look = CHARS[b.dataset.n].look;
    drawPerson(b.querySelector("canvas").getContext("2d"), 0, 0, G.goldHat ? { ...look, hat: GOLD_HAT } : look);
    b.onclick = () => { S.name = b.dataset.n; overlay.hidden = true; SFX.select(); saveSlot(); say(startLines(S.name), saveSlot); };
  });
  overlay.querySelector("button").focus();
}

// ---------- in-game menu and its pages ----------
export function menu() {
  const items = [["Field Notebook", () => notebook(menu)], ["Badges", () => badgeCase(menu)], ["Town map", () => townMap(menu)],
    ["Achievements", () => achievementsPage(menu)], ["Settings", () => settingsPage(menu)], ["Controls", () => controls(menu)],
    ["Save", () => { saveSlot(); toast(S.slot == null ? "Demo runs aren't saved" : "Game saved"); }], ["Quit to title", () => { saveSlot(); title(); }]];
  page(`<div class="page note"><div class="proto">Menu</div><h2>${S.name} · ${MAPS[S.map].name}</h2>
    <p>Badges: ${S.badges} of 3 · Hint potions: ${S.potions} · Played ${clock(S.playMs)}</p>
    <div class="menu-grid">${items.map(([n], i) => `<button data-i="${i}">${n}</button>`).join("")}</div>
    <div class="row" style="margin-top:auto"><button id="close">Back to the game</button></div></div>`);
  pageEl.querySelectorAll(".menu-grid button").forEach((b) => (b.onclick = () => items[b.dataset.i][1]()));
  S.back = toMap; $("#close").onclick = toMap;
  pageEl.querySelector(".menu-grid button").focus({ preventScroll: true });
}
const closeRow = (label = "Close") => `<div class="row" style="margin-top:auto"><button id="close">${label}</button></div>`;
function wireBack(back) { S.back = back; $("#close").onclick = back; }
export function notebook(back = toMap) {
  const rec = LEVELS.flatMap((l, li) => l.steps.map((st, si) => ({ st, li, si, key: stepKey(li, si) }))).filter((r) => r.key in S.results);
  const facts = FACTS.filter((f) => S.facts.includes(f.id));
  page(`<div class="page note"><div class="proto">Field Notebook</div><h2>${S.name}'s Notebook</h2>
    <p class="topic">${rec.length} of ${totalSteps()} patterns recorded</p>
    ${rec.length ? rec.map(({ st, li, si }) => `<div class="entry"><b>${st.foe}</b> · <span class="topic">${st.topic}</span><p>${st.explanation}</p>
      ${st.why ? `<p><i>Why it matters:</i> ${st.why}</p>` : ""}${st.cite ? `<p class="cite">Source: ${st.cite}</p>` : ""}
      ${li < 3 ? `<button class="small" data-l="${li}" data-s="${si}">Battle again</button>` : ""}</div>`).join("") : "<p>No entries yet. Go find some patterns!</p>"}
    <h2 class="h3">Hidden notes (${facts.length} of ${FACTS.length})</h2>
    ${facts.length ? facts.map((f) => `<p>• ${f.text}</p>`).join("") : "<p>Some notes are hidden in the tall grass.</p>"}
    <h2 class="h3">Glossary</h2><dl class="gloss">${GLOSSARY.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join("")}</dl>${closeRow()}</div>`);
  pageEl.querySelectorAll("button[data-l]").forEach((b) => (b.onclick = () => practiceBattle(+b.dataset.l, +b.dataset.s)));
  wireBack(back);
}
export function entryPage(st, wrongs, onNext) {
  const notes = wrongs.map((o) => `<p class="wrongnote"><b>You tried ${o.text}:</b> ${o.whyWrong}</p>`).join("");
  page(`<div class="page note"><div class="proto">Field Notebook · new entry</div><h2>${st.foe}</h2><p class="topic">${st.topic}</p>
    ${st.anim ? '<canvas class="anim" width="420" height="220" role="img" aria-label="Animation showing the rule"></canvas>' : ""}
    ${st.extras ? `<div class="extras">${st.extras.map((e) => `<figure><canvas width="160" height="120" role="img" aria-label="${e.label}"></canvas><figcaption>${e.label}</figcaption></figure>`).join("")}</div>` : ""}
    <p>${st.explanation}</p>
    ${st.polya ? `<p><i>Look back:</i> ${st.polya.lookBack}</p>` : ""}${st.why ? `<p><i>Why it matters:</i> ${st.why}</p>` : ""}
    ${notes}${st.cite ? `<p class="cite">Source: ${st.cite}</p>` : ""}
    <div class="row" style="margin-top:auto"><button id="nx">Next ▶</button></div></div>`);
  if (st.anim) runAnim(pageEl.querySelector("canvas.anim"), st.anim);
  if (st.extras) pageEl.querySelectorAll(".extras canvas").forEach((c, i) => drawFigure(c, { type: "tiles", sides: st.extras[i].sides }));
  $("#nx").focus({ preventScroll: true });
  $("#nx").onclick = () => { SFX.select(); onNext(); };
}
export function badgeCase(back = toMap) {
  page(`<div class="page note"><div class="proto">Badge case</div><h2>${S.name}'s Badges</h2>
    <div class="badgecase">${BADGES.map((b, i) => `<div><canvas class="badge" width="64" height="64" role="img" aria-label="${i < S.badges ? b : "Badge not earned yet"}"></canvas>
      <p><b>${i < S.badges ? b : "???"}</b></p><p class="topic">${LEVELS[i].name}</p><p>${stars(i)}</p></div>`).join("")}</div>${closeRow()}</div>`);
  pageEl.querySelectorAll("canvas.badge").forEach((c, i) => drawBadge(c.getContext("2d"), i, i < S.badges));
  wireBack(back);
}
export function townMap(back = toMap) {
  const where = { lab: [5, 7], garden: [3, 1], hive: [8, 1], field: [13, 1] }[S.map] || [S.px, S.py];
  page(`<div class="page note"><div class="proto">Town map</div><h2>Barangay Maligaya</h2>
    <canvas class="townmap" width="240" height="160" role="img" aria-label="Map of Barangay Maligaya"></canvas>
    <p>You are in <b>${MAPS[S.map].name}</b> (the red circle).</p>
    <ul>${LEVELS.slice(0, 3).map((l, i) => `<li>${l.name}: ${i < S.badges ? `restored ${stars(i)}` : i === S.badges ? "next" : "locked"}</li>`).join("")}</ul>${closeRow()}</div>`);
  const c = pageEl.querySelector(".townmap").getContext("2d");
  drawMapTo(c, "town");
  c.strokeStyle = "#d04030"; c.lineWidth = 2; c.beginPath(); c.arc(where[0] * 16 + 8, where[1] * 16 + 8, 10, 0, 7); c.stroke();
  wireBack(back);
}
export function achievementsPage(back = toMap) {
  page(`<div class="page note"><div class="proto">Achievements</div><h2>Achievements</h2>
    <p class="topic">${G.achievements.length} of ${Object.keys(ACHIEVEMENTS).length} unlocked${G.goldHat ? " · Golden hat earned" : ""}</p>
    <ul class="ach">${Object.entries(ACHIEVEMENTS).map(([id, [name, how]]) => `<li class="${G.achievements.includes(id) ? "got" : ""}"><b>${G.achievements.includes(id) ? "★" : "☆"} ${name}</b> · ${how}</li>`).join("")}</ul>${closeRow()}</div>`);
  wireBack(back);
}
export function settingsPage(back = toMap) {
  page(`<div class="page note"><div class="proto">Settings</div><h2>Settings</h2>
    <p><b>Text speed</b></p>
    <div class="row seg" style="justify-content:flex-start">${Object.keys(SPEEDS).map((k) => `<button data-s="${k}" class="${settings.speed === k ? "on" : ""}">${k[0].toUpperCase() + k.slice(1)}</button>`).join("")}</div>
    <p><b>Volume</b></p><input id="vol" type="range" min="0" max="100" step="5" value="${Math.round(settings.vol * 100)}" style="max-width:320px" aria-label="Volume">
    <label class="check"><input type="checkbox" id="big" ${settings.bigText ? "checked" : ""}> Larger text</label>
    <label class="check"><input type="checkbox" id="conf" ${settings.confirm ? "checked" : ""}> Ask before using an answer (protects your HP from misclicks)</label>
    ${closeRow("Done")}</div>`);
  pageEl.querySelectorAll(".seg button").forEach((b) => (b.onclick = () => { settings.speed = b.dataset.s; saveGlobal(); SFX.select(); settingsPage(back); }));
  $("#vol").oninput = (e) => { settings.vol = e.target.value / 100; SFX.blip(); };
  $("#big").onchange = (e) => { settings.bigText = e.target.checked; document.body.classList.toggle("big", settings.bigText); };
  $("#conf").onchange = (e) => { settings.confirm = e.target.checked; };
  wireBack(() => { saveGlobal(); back(); });
}
export function controls(back = toMap) {
  const keys = [["Arrow keys / WASD", "Walk; move around the battle menu"], ["Click or tap the map", "Walk there"], ["Enter / Space / Z", "Talk, read signs, pick an answer, continue text"],
    ["Hold X", "Fast-forward through text"], ["Esc / P", "Menu (Esc also closes pages)"], ["N / B", "Field Notebook / Badge case"],
    ["T", "Try it (in battles that have it)"], ["B (in battle)", "Use a Hint Potion"], ["M", "Sound on or off"]];
  page(`<div class="page note"><div class="proto">Controls</div><h2>Controls</h2>
    <table class="keys">${keys.map(([k, d]) => `<tr><td><kbd>${k}</kbd></td><td>${d}</td></tr>`).join("")}</table>
    <p>On a phone, tap the map to walk, or use the arrows and the A and B buttons under the screen.</p>${closeRow("Back")}</div>`);
  wireBack(back);
}
export function playtestPage(back = title) { // numbers for the progress report, kept in this browser only
  const med = (a) => { if (!a.length) return "–"; const s = [...a].sort((x, y) => x - y); return `${(s[Math.floor(s.length / 2)] / 1000).toFixed(1)} s`; };
  const rows = LEVELS.flatMap((l, li) => l.steps.map((st, si) => {
    const s = G.stats[stepKey(li, si)] || { plays: 0, firstTry: 0, wrong: {}, ms: [] };
    const wrong = Object.entries(s.wrong).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ×${n}`).join(", ") || "–";
    return [st.id, st.topic, s.plays, s.plays ? `${Math.round((100 * s.firstTry) / s.plays)}%` : "–", med(s.ms), wrong];
  }));
  const head = ["Step", "Topic", "Solved", "First try", "Median time", "Wrong picks"];
  page(`<div class="page note"><div class="proto">Playtest data</div><h2>Playtest data</h2>
    <p>Saved in this browser only. Run every playtest on one computer, then copy the table into the report.</p>
    <div class="tablewrap"><table class="stats"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <p class="copied" aria-live="polite"></p>
    <div class="row" style="margin-top:auto"><button id="copy">Copy as text</button><button id="reset">Reset stats</button><button id="close">Back</button></div></div>`);
  $("#copy").onclick = () => {
    const text = [head, ...rows].map((r) => r.join("\t")).join("\n"), msg = pageEl.querySelector(".copied");
    navigator.clipboard.writeText(text).then(() => (msg.textContent = "Copied. Paste it into a spreadsheet or the report."))
      .catch(() => { msg.innerHTML = `<textarea rows="6" style="width:100%">${text}</textarea>`; msg.querySelector("textarea").select(); });
  };
  $("#reset").onclick = () => choice("Reset all playtest stats on this computer?", ["Reset", "Cancel"], (i) => { if (i === 0) { resetStats(); playtestPage(back); } });
  wireBack(back);
}
function demo() { // for the live presentation: start at any Level with the earlier badges already earned
  const spots = [["The Garden", 0, "garden", 8, 8], ["The Beehive", 1, "hive", 8, 8], ["The Sunflower Field", 2, "field", 8, 8], ["Final battle", 3, "lab", 8, 4]];
  page(`<div class="page title"><h1>Demo mode</h1><p>Jump straight to a Level as CHIPPY. Earlier badges are given to you, and nothing is saved.</p>
    <div class="row">${spots.map(([n], i) => `<button data-i="${i}">${n}</button>`).join("")}</div>${closeRow("Back")}</div>`);
  pageEl.querySelectorAll("button[data-i]").forEach((b) => (b.onclick = () => {
    const [, badges, map, x, y] = spots[b.dataset.i];
    freshRun("CHIPPY", null);
    const results = {};
    for (let l = 0; l < badges; l++) LEVELS[l].steps.forEach((_, s) => (results[stepKey(l, s)] = true));
    Object.assign(S, { badges, results, map, px: x, py: y, dir: "up", potions: 3, rivalWins: badges, flags: { seen0: true, seen1: true, seen2: true } });
    SFX.select(); show("map");
  }));
  wireBack(title);
}
export function speedResults(score) {
  page(`<div class="page title"><h1>Time's up!</h1><p style="font-size:30px">${score} right in 60 seconds</p>
    <p>${score >= 8 ? "Quick thinker! Achievement unlocked." : "Score 8 or more to unlock Quick thinker."}</p>
    <div class="row"><button id="again">Go again</button><button id="close">Title</button></div></div>`);
  $("#again").onclick = speedBattle; wireBack(title);
}

// ---------- endings ----------
export function endingScene() { // Sir Durwin turns through the notebook, one recorded pattern per page
  const pages = LEVELS.flatMap((l) => l.steps);
  let i = 0;
  const turn = () => {
    if (i >= pages.length) return hallOfFame();
    const st = pages[i];
    page(`<div class="page note"><div class="proto">Sir Durwin reads your notebook · page ${i + 1} of ${pages.length}</div>
      <div class="flip"><h2>${st.foe}</h2><canvas width="320" height="180" role="img" aria-label="${describe(st.figure)}"></canvas><p class="topic">${st.topic}</p></div>
      <div class="row" style="margin-top:auto"><button id="nx">${i + 1 < pages.length ? "Turn the page ▶" : "Close the notebook ▶"}</button></div></div>`);
    drawFigure(pageEl.querySelector(".flip canvas"), st.figure);
    $("#nx").onclick = () => { if (boxOpen()) return; i++; SFX.select(); turn(); };
    say([`SIR DURWIN: ${ENDING_LINES[i] || "Splendid."}`], () => $("#nx")?.focus({ preventScroll: true }));
  };
  say(["SIR DURWIN: Let's look through your Field Notebook together."], turn);
}
export function hallOfFame() {
  const score = Object.values(S.results).filter(Boolean).length, total = totalSteps();
  const real = S.slot != null, perfect = real && score === total; // demo runs start with Levels already solved, so they earn nothing
  if (perfect) { G.goldHat = true; saveGlobal(); unlock("perfect"); }
  if (real && S.blackouts === 0) unlock("unshaken");
  saveSlot(); SFX.badge();
  page(`<div class="page title"><h1>Hall of Fame</h1><canvas class="hero" width="16" height="16" role="img" aria-label="${S.name}"></canvas>
    <p>${CHARS[S.name].win}</p>
    <div class="row">${BADGES.map((b) => `<canvas class="badge" width="64" height="64" style="width:56px;height:56px" role="img" aria-label="${b}"></canvas>`).join("")}</div>
    <p>${LEVELS.slice(0, 3).map((l, i) => `${l.name} ${stars(i)}`).join(" · ")}</p>
    <p style="font-size:26px">${score} of ${total} on the first try · ${clock(S.playMs)} played</p>
    ${perfect ? "<p>A perfect run! You've earned the golden hat for every new adventure.</p>" : ""}
    <div class="row"><button id="cred">Credits</button><button id="again">Title</button></div></div>`);
  drawPerson(pageEl.querySelector(".hero").getContext("2d"), 0, 0, playerLook());
  pageEl.querySelectorAll("canvas.badge").forEach((c, i) => drawBadge(c.getContext("2d"), i, true));
  $("#cred").onclick = credits; $("#again").onclick = title;
}
export function credits() {
  page(`<div class="page title"><div class="credits"><div class="roll">
    <h1>Pattern Detectives</h1><p>MATH 10 · Mathematics in the Modern World · Section M2</p>
    <h3>Team</h3><p>Bryce Go · Mathematics lead and writer</p><p>Joshua Tan · Game developer</p><p>Adrian Wong · Art, audio, and documentation</p>
    <h3>Instructor</h3><p>Durwin C. Santos, M.S., our Sir Durwin</p>
    <h3>References</h3><p>Bataller et al. (2019) · Devlin (2000) · Hales (2001)</p><p>Knott (n.d.) · Stewart (2017)</p>
    <h3>Art and sound</h3><p>Placeholder pixel art and chiptune made in code</p>
    <h3>Thanks for playing!</h3></div></div>
    <div class="row"><button id="close">Title</button></div></div>`);
  wireBack(title);
}
