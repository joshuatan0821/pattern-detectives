// Battles: students (two rounds each), the rival, wild patterns, Sir Durwin's Conclusion, practice replays, and the speed battle.
import { S, settings, saveSlot, unlock, stat, beaten } from "./state.js";
import { LEVELS, BADGES, RIVAL, DURWIN, stepKey, playerLook } from "./content.js";
import { drawFigure, drawPerson, drawFlake, describe } from "./draw.js";
import { generate, POLY } from "./questions.js";
import { SFX } from "./audio.js";
import { say, choice, show, flash, boxOpen, entryPage, endingScene, notebook, speedResults } from "./ui.js";
import { goHome } from "./world.js";

const battleEl = document.querySelector("#battle");
const MAX_HP = 3;
const FIELD = ["#c8e8f8 0 52%, #a8d880 52%", "#f8e8b0 0 52%, #e0c060 52%", "#d8f0f8 0 52%, #c8d860 52%", "#e8e0d0 0 52%, #c8b898 52%"]; // garden, hive, field, lab
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const B = {}; // the battle in progress
export const stars = (lv) => LEVELS[lv].steps.map((_, i) => (S.results[stepKey(lv, i)] ? "★" : "☆")).join("");

// ---------- who you battle ----------
export function studentBattle(p) {
  const s = p.student, st = LEVELS[s.level].steps[s.step];
  run({ kind: "student", level: s.level, trainer: { label: `STUDENT ${s.name}`, look: p.look, intro: s.intro, lose: s.lose },
    rounds: [{ st, key: stepKey(s.level, s.step) }, { st: generate(s.level) }],
    onWin: (wrongs) => entryPage(st, wrongs, () => afterStep(s.level)) });
}
export function rivalBattle() {
  const n = S.rivalWins, lv = Math.min(n, 2);
  run({ kind: "rival", level: lv, trainer: { label: RIVAL.label, look: RIVAL.look, intro: RIVAL.intro[n], lose: RIVAL.lose[n] },
    rounds: [{ st: generate(lv) }, { st: generate(lv) }],
    onWin: () => { S.rivalWins++; saveSlot(); if (S.rivalWins >= 3) unlock("rival"); show("map"); } });
}
export function wildBattle(lv) {
  run({ kind: "wild", level: lv, trainer: null, rounds: [{ st: generate(lv) }],
    onWin: () => { S.wildWins++; saveSlot(); if (S.wildWins >= 5) unlock("wild"); show("map"); } });
}
export function finalBattle() {
  const st = LEVELS[3].steps[0];
  run({ kind: "final", level: 3, trainer: { label: "SIR DURWIN", look: DURWIN, intro: "All three badges! Let's see what you've learned.", lose: "Splendid. You've seen the big picture." },
    rounds: [{ st, key: stepKey(3, 0) }], onWin: (wrongs) => entryPage(st, wrongs, endingScene) });
}
export function practiceBattle(level, step) { // replay from the notebook: no scoring, plus a fresh practice question
  run({ kind: "practice", level, trainer: { label: "SIR DURWIN", look: DURWIN, intro: "Practice makes patterns! Let's try that one again.", lose: "Well practiced!" },
    rounds: [{ st: LEVELS[level].steps[step] }, { st: generate(level) }], onWin: () => notebook() });
}
function afterStep(level) {
  if (LEVELS[level].steps.every((_, i) => beaten(level, i))) return levelDone(level);
  show("map"); say(["Another student here is still waiting to battle."]);
}
function levelDone(level) {
  S.badges = Math.max(S.badges, level + 1); saveSlot();
  const steps = LEVELS[level].steps.length, firsts = LEVELS[level].steps.filter((_, i) => S.results[stepKey(level, i)]).length;
  if (firsts === steps) unlock("perfectSite");
  show("map"); SFX.badge();
  say([`${S.name} earned the ${BADGES[level]}!`, `${LEVELS[level].name}: ${stars(level)} (${firsts} of ${steps} on the first try)`,
       `The patterns of ${LEVELS[level].name} are back in order!`], () =>
    choice(S.badges === 3 ? "All three badges! Hurry back to SIR DURWIN?" : "Hurry back to the Field Station?", ["Yes", "No"], (i) => { if (i === 0) goHome(); }));
}

// ---------- the battle itself ----------
function run(cfg) { Object.assign(B, { cfg, firstTry: true, wrongs: [], retry: false, speed: false }); begin(); }
function begin() { // start, or restart after blacking out, from the first round
  B.round = 0; B.hp = MAX_HP; S.path = [];
  flash(() => {
    render();
    const T = B.cfg.trainer;
    if (!T) return say([`A wild ${B.st.foe} appeared!`]);
    say([`${T.label}: ${B.retry ? "Let's try that again!" : T.intro}`], () => { sendOut(); say([`${T.label} sent out ${B.st.foe}!`]); });
  });
}
const bagLabel = () => `Bag: ${S.potions} hint potion${S.potions === 1 ? "" : "s"} (B)`;
function render() {
  const { cfg } = B, st = (B.st = cfg.rounds[B.round].st), T = cfg.trainer, withTrainer = T && B.round === 0;
  B.opts = shuffle(st.options); B.tier = 0; B.sel = 0; B.t0 = performance.now();
  battleEl.innerHTML = `<div class="battle">
    <div class="field" style="background:linear-gradient(${FIELD[Math.min(cfg.level, 3)]})">
      <div class="tag foe-tag"><b>${withTrainer ? T.label : st.foe}</b><small>${withTrainer ? "wants to battle!" : st.topic}</small></div>
      ${withTrainer ? `<canvas class="trainer" width="16" height="16" role="img" aria-label="${T.label}"></canvas>` : ""}
      <canvas class="foe" width="320" height="180" role="img" aria-label="${describe(st.figure)}" style="opacity:${withTrainer ? 0 : 1}"></canvas>
      <canvas class="me" width="16" height="16" role="img" aria-label="${S.name}"></canvas>
      <div class="tag me-tag"><b>${S.name}</b><div class="hp"><span>HP</span><div class="bar"><i></i></div></div><small class="hpn"></small></div>
      ${cfg.rounds.length > 1 ? `<div class="round">Round ${B.round + 1} of ${cfg.rounds.length}</div>` : ""}
      <div class="tryit" hidden></div>
    </div>
    <div class="panel"><p class="q">${st.question}</p><div class="sub" hidden></div>
      <div class="moves">${B.opts.map((o, i) => `<button data-i="${i}" aria-label="${o.figure ? `${o.text}: ${describe(o.figure)}` : o.text}">${o.figure ? '<canvas width="150" height="84" aria-hidden="true"></canvas>' : ""}<span>${o.text}</span></button>`).join("")}</div>
      <div class="actions">${st.tryIt ? '<button id="tryBtn">Try it (T)</button>' : ""}<button id="bagBtn">${bagLabel()}</button>${cfg.kind === "wild" ? '<button id="runBtn">Run</button>' : ""}</div>
    </div></div>`;
  show("battle");
  drawFigure(battleEl.querySelector("canvas.foe"), st.figure);
  if (withTrainer) drawPerson(battleEl.querySelector("canvas.trainer").getContext("2d"), 0, 0, T.look);
  drawPerson(battleEl.querySelector("canvas.me").getContext("2d"), 0, 0, playerLook(), 0, "up");
  updateHp(); markSel();
  battleEl.querySelectorAll(".moves button").forEach((btn) => {
    const o = B.opts[btn.dataset.i];
    if (o.figure) drawFigure(btn.querySelector("canvas"), o.figure);
    btn.onclick = () => pick(o, btn);
  });
  battleEl.querySelector("#bagBtn").onclick = useBag;
  if (st.tryIt) battleEl.querySelector("#tryBtn").onclick = tryIt;
  if (cfg.kind === "wild") battleEl.querySelector("#runBtn").onclick = () => !boxOpen() && say(["Got away safely!"], () => show("map"));
}
function sendOut() { // the trainer steps aside and the pattern pops in
  const trainer = battleEl.querySelector("canvas.trainer"), foe = battleEl.querySelector("canvas.foe");
  trainer.animate([{ transform: "translateX(0)", opacity: 1 }, { transform: "translateX(140%)", opacity: 0 }], { duration: 450 });
  foe.animate([{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1)" }], { duration: 450 });
  trainer.style.opacity = 0; foe.style.opacity = 1; // the end state, even if the tab isn't animating
  battleEl.querySelector(".foe-tag").innerHTML = `<b>${B.st.foe}</b><small>${B.st.topic}</small>`;
  SFX.select();
}
function updateHp() {
  const bar = battleEl.querySelector(".bar i");
  bar.style.width = `${(B.hp / MAX_HP) * 100}%`;
  bar.style.background = B.hp === 1 ? "#e04830" : B.hp === 2 ? "#f0c030" : "";
  battleEl.querySelector(".hpn").textContent = `${B.hp}/${MAX_HP}` + (S.streak ? ` · streak ${S.streak}` : "");
}
function markSel() {
  const btns = [...battleEl.querySelectorAll(".moves button")];
  if (btns[B.sel]?.disabled) B.sel = Math.max(0, btns.findIndex((b) => !b.disabled));
  btns.forEach((b, i) => b.classList.toggle("sel", i === B.sel));
}
function shake() {
  battleEl.querySelector(".field").animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }], { duration: 260 });
  battleEl.querySelector("canvas.me")?.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: 500 });
}
function pick(o, btn) {
  if (boxOpen() || btn.disabled || S.mode !== "battle") return;
  if (B.speed) return speedPick(o, btn);
  if (!settings.confirm) return resolve(o, btn);
  choice(`Use ${o.text}?`, ["Yes", "No"], (i) => { if (i === 0) resolve(o, btn); });
}
function resolve(o, btn) {
  const r = B.cfg.rounds[B.round], st = B.st, T = B.cfg.trainer, last = B.round === B.cfg.rounds.length - 1;
  if (o.correct) {
    if (r.key) { // an authored Step: record it once, plus playtest stats
      const first = B.firstTry;
      if (!(r.key in S.results)) S.results[r.key] = first;
      S.streak = first ? S.streak + 1 : 0;
      if (S.slot != null) stat(r.key, (s) => { s.plays++; if (first) s.firstTry++; s.ms.push(Math.round(performance.now() - B.t0)); }); // demo runs don't count
    }
    SFX.hit(); setTimeout(SFX.win, 450);
    const foe = battleEl.querySelector("canvas.foe");
    foe.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(40px)", opacity: 0 }], { duration: 600 });
    foe.style.opacity = 0;
    const lines = [st.effect || "It's super effective!", r.key ? `${st.foe} was recorded in your Field Notebook!` : `${st.foe} fainted!`,
      ...(r.key && S.streak >= 2 ? [`First-try streak: ${S.streak}!`] : [])];
    if (!last) return say([...lines, `${T.label}: I'm not done yet!`], () => { B.round++; render(); say([`${T.label} sent out ${B.st.foe}!`]); });
    return say([...lines, ...(T ? [`${T.label}: ${T.lose}`] : [])], () => { unlock("first"); saveSlot(); B.cfg.onWin(B.wrongs); });
  }
  btn.disabled = true; B.hp--; S.streak = 0;
  if (B.round === 0) { B.firstTry = false; if (!B.wrongs.includes(o)) B.wrongs.push(o); }
  if (r.key && S.slot != null) stat(r.key, (s) => { s.wrong[o.text] = (s.wrong[o.text] || 0) + 1; });
  updateHp(); markSel(); SFX.wrong(); shake();
  if (B.hp <= 0) {
    S.blackouts++;
    if (B.cfg.kind === "wild") return say([`${S.name} is out of HP!`, `The wild ${st.foe} got away, and ${S.name} hurried back to safety.`], () => show("map"));
    return say([`${S.name} is out of HP!`, `${S.name} blacked out!`, "SIR DURWIN: Don't give up. Let's look at that one again."], () => { B.retry = true; begin(); });
  }
  say([`Not quite... ${S.name} lost 1 HP!`, o.whyWrong], () => showHint(B.tier + 1));
}

// ---------- hints, the bag, and "Try it" ----------
function showHint(tier) { // tier 1: Polya's "understand"; tier 2: "plan", with the key part of the Figure highlighted
  const st = B.st, P = st.polya;
  B.tier = Math.max(B.tier, Math.min(tier, 2));
  const text = B.tier === 1 ? (P ? `Understand: ${P.understand}` : st.hint) : (P ? `Plan: ${P.plan}` : `${st.hint} Look at the part marked in red.`);
  const sub = battleEl.querySelector(".sub");
  sub.hidden = false;
  sub.innerHTML = `<canvas width="16" height="16" aria-hidden="true"></canvas><span><b>SIR DURWIN:</b> ${text}</span>`;
  drawPerson(sub.querySelector("canvas").getContext("2d"), 0, 0, DURWIN);
  if (B.tier >= 2) drawFigure(battleEl.querySelector("canvas.foe"), { ...st.figure, hl: true });
}
function useBag() {
  if (boxOpen() || B.speed) return;
  if (!S.potions) return say(["Your bag has no HINT POTIONS. Look for notes hidden in the tall grass!"]);
  if (B.tier >= 2) return say(["You've already seen every hint for this one."]);
  S.potions--; saveSlot();
  battleEl.querySelector("#bagBtn").textContent = bagLabel();
  say([`${S.name} used a HINT POTION!`], () => showHint(B.tier + 1));
}
const deg = (x) => `${Math.round(x * 10) / 10}°`;
function tryIt() { // a small hands-on version of the Figure to explore before answering
  const kind = B.st.tryIt, panel = battleEl.querySelector(".tryit");
  if (!kind || boxOpen()) return;
  const controls = {
    reflect: '<button data-v="flip">Flip it</button><button data-v="turn">Turn it 180°</button><button data-v="slide">Slide it</button>',
    rotate: '<label>Turn: <input type="range" min="0" max="180" step="5" value="0" aria-label="Turn angle in degrees"></label>',
    tiles: [5, 6, 7, 8].map((n) => `<button data-n="${n}">${POLY[n]}</button>`).join("") + '<button data-add="1">Add a tile</button>',
    spirals: '<button data-f="21">Show 21 spirals</button><button data-f="34">Show 34 spirals</button><button data-f="0">Seeds only</button>',
  }[kind];
  panel.innerHTML = `<canvas width="320" height="190" role="img" aria-label="Hands-on version of the Figure"></canvas>
    <p class="tmsg" aria-live="polite"></p><div class="row">${controls}</div><button class="close">Back to battle (T)</button>`;
  panel.hidden = false;
  const c = panel.querySelector("canvas"), msg = panel.querySelector(".tmsg");
  const state = { v: null, angle: 0, sides: 5, count: 1, family: 0 };
  const draw = () => {
    const ctx = c.getContext("2d");
    if (kind === "reflect") {
      drawFigure(c, { type: "butterfly", right: { flip: "mirror", turn: "rotate", slide: "copy" }[state.v] || "missing" });
      msg.textContent = { flip: "Flipped across the body: both halves match exactly!", turn: "Turned 180°: the wing is upside down, so it doesn't match.",
        slide: "Slid across without flipping: the wing points the wrong way." }[state.v] || "Move a copy of the left wing to the right side.";
    }
    if (kind === "rotate") {
      ctx.clearRect(0, 0, c.width, c.height); ctx.save(); ctx.translate(c.width / 2, c.height / 2);
      drawFlake(ctx, 80, 0, -1, 0.2); drawFlake(ctx, 80, (state.angle * Math.PI) / 180, 0, 1); ctx.restore();
      msg.textContent = state.angle === 0 ? "Drag the slider to turn the snowflake." : state.angle % 60 === 0 ? `Turned ${state.angle}°: it lands exactly on itself!` : `Turned ${state.angle}°: the arms don't line up yet.`;
    }
    if (kind === "tiles") {
      drawFigure(c, { type: "tiles", sides: state.sides, count: state.count });
      const a = ((state.sides - 2) * 180) / state.sides, sum = state.count * a, off = Math.round((sum - 360) * 10) / 10;
      msg.textContent = `${state.count} × ${deg(a)} = ${deg(sum)}: ` + (Math.abs(off) < 0.01 ? "a perfect fit!" : off < 0 ? `${deg(-off)} left to fill.` : `overlaps by ${deg(off)}.`);
    }
    if (kind === "spirals") {
      drawFigure(c, { type: "sunflower", family: state.family });
      msg.textContent = { 21: "Red lines join seeds 21 apart: they trace 21 spirals turning one way.", 34: "Blue lines join seeds 34 apart: they trace 34 spirals turning the other way." }[state.family] || "Pick a family of spirals to trace.";
    }
  };
  panel.querySelectorAll("button[data-v]").forEach((b) => (b.onclick = () => { state.v = b.dataset.v; draw(); }));
  panel.querySelectorAll("button[data-n]").forEach((b) => (b.onclick = () => { state.sides = +b.dataset.n; state.count = 1; draw(); }));
  panel.querySelectorAll("button[data-add]").forEach((b) => (b.onclick = () => { // add copies until they overlap, then start again
    const a = ((state.sides - 2) * 180) / state.sides;
    state.count = state.count * a >= 360 - 1e-9 ? 1 : state.count + 1; draw();
  }));
  panel.querySelectorAll("button[data-f]").forEach((b) => (b.onclick = () => { state.family = +b.dataset.f; draw(); }));
  const range = panel.querySelector("input[type=range]");
  if (range) range.oninput = () => { state.angle = +range.value; draw(); };
  panel.querySelector(".close").onclick = () => (panel.hidden = true);
  draw();
}
export function battleKey(k) {
  const panel = battleEl.querySelector(".tryit");
  if (panel && !panel.hidden) { if (k === "Escape" || k === "t") panel.hidden = true; return; }
  if (B.speed && k === "Escape") return endSpeed();
  if (!B.speed && k === "t") return tryIt();
  if (!B.speed && k === "b") return useBag();
  const btns = [...battleEl.querySelectorAll(".moves button")];
  const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -2, ArrowDown: 2, a: -1, d: 1, w: -2, s: 2 }[k];
  if (d !== undefined) { const n = B.sel + d; if (n >= 0 && n < btns.length && !btns[n].disabled) { B.sel = n; SFX.blip(); } markSel(); return; }
  if (["Enter", " ", "z"].includes(k) && btns[B.sel]) btns[B.sel].click();
}

// ---------- speed battle: as many practice questions as you can in 60 seconds ----------
export function speedBattle() {
  Object.assign(B, { speed: true, score: 0, locked: false, end: performance.now() + 60000 });
  flash(() => { nextSpeed(); clearInterval(B.timer); B.timer = setInterval(tickSpeed, 100); });
}
function nextSpeed() {
  const st = (B.st = generate(-1));
  B.opts = shuffle(st.options); B.sel = 0;
  battleEl.innerHTML = `<div class="battle">
    <div class="field" style="background:linear-gradient(${FIELD[3]})">
      <div class="tag foe-tag"><b>SPEED BATTLE</b><small>Score: ${B.score} · Esc to stop</small></div>
      <canvas class="foe" width="320" height="180" role="img" aria-label="${describe(st.figure)}"></canvas>
      <div class="timer" aria-hidden="true"><i></i></div>
    </div>
    <div class="panel"><p class="q">${st.question}</p><div class="sub" hidden></div>
      <div class="moves">${B.opts.map((o, i) => `<button data-i="${i}">${o.figure ? '<canvas width="150" height="84" aria-hidden="true"></canvas>' : ""}<span>${o.text}</span></button>`).join("")}</div>
    </div></div>`;
  show("battle");
  drawFigure(battleEl.querySelector("canvas.foe"), st.figure);
  markSel();
  battleEl.querySelectorAll(".moves button").forEach((btn) => { const o = B.opts[btn.dataset.i]; btn.onclick = () => pick(o, btn); });
  tickSpeed();
}
function speedPick(o, btn) {
  if (B.locked) return;
  if (o.correct) { B.score++; SFX.select(); return nextSpeed(); }
  SFX.wrong(); B.locked = true; btn.disabled = true;
  const sub = battleEl.querySelector(".sub"); sub.hidden = false; sub.textContent = o.whyWrong;
  setTimeout(() => { B.locked = false; if (B.speed) nextSpeed(); }, 1400);
}
function tickSpeed() {
  const left = B.end - performance.now(), bar = battleEl.querySelector(".timer i");
  if (bar) bar.style.width = `${Math.max(0, left / 600)}%`;
  if (left <= 0) endSpeed();
}
function endSpeed() {
  clearInterval(B.timer); B.speed = false; B.locked = false;
  if (B.score >= 8) unlock("speed");
  SFX.badge(); speedResults(B.score);
}
