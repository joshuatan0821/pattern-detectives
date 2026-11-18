// World content: maps, people, dialogue, and reference text.
// The Steps themselves live only in game/data/*.json (ADR 0002); this file holds everything around them.
import { S, G } from "./state.js";

export const LEVELS = [];
export async function loadLevels() {
  const files = ["data/level-1.json", "data/level-2.json", "data/level-3.json", "data/conclusion.json"];
  const data = await Promise.all(files.map(async (f) => {
    const r = await fetch(f);
    if (!r.ok) throw new Error(`${f} (${r.status})`);
    return r.json();
  }));
  LEVELS.push(...data);
}
export const totalSteps = () => LEVELS.reduce((n, l) => n + l.steps.length, 0);
export const stepKey = (level, step) => `${level}-${step}`;
export const BADGES = ["Fibonacci Badge", "Logic Badge", "Statistics Badge"];

// ---------- people ----------
export const DURWIN = { hat: "#b8b8c0", shirt: "#f8f8f8", pants: "#404858", glasses: true, coat: true };
export const CHARS = {
  CHIPPY: { look: { hat: "#48a050", shirt: "#f08030", pants: "#3a3a48", pack: "#a0522d" },
            pick: "CHIPPY: Notebook ready, pencil sharpened. Let's go!", win: "CHIPPY: Every page is full. Best field trip ever!" },
  BRYCE: { look: { hat: "#3a2a20", shirt: "#3878c8", pants: "#5a4630", pack: "#2f4f6f" },
           pick: "BRYCE: Patterns? I'll check every answer twice.", win: "BRYCE: Checked, double-checked, and recorded!" },
  JOSHUA: { look: { hat: "#181818", shirt: "#c03838", pants: "#303848", pack: "#5a6070" },
            pick: "JOSHUA: I'll figure out the rule behind all of it.", win: "JOSHUA: Every pattern ran on a rule. Just like code!" },
};
export const GOLD_HAT = "#f0c020"; // the perfect-run reward
export function playerLook() {
  const c = CHARS[S.name];
  if (!c) return null;
  return G.goldHat ? { ...c.look, hat: GOLD_HAT } : c.look;
}
export const RIVAL = {
  label: "RIVAL XANDER", look: { hat: "#5040a0", shirt: "#40a0a0", pants: "#283040" },
  intro: ["Hey! I've been collecting patterns too. Bet my notebook beats yours!",
          "Back again? I practiced my tiling all week. Let's go!",
          "Last time, for real. Fibonacci won't save you!"],
  lose: ["Hmph. Lucky guess... I'll be back!", "You know your angles. Next time, though!", "Okay, okay. You're the real Pattern Detective."],
};
const look = (hat, shirt, pants) => ({ hat, shirt, pants });
const student = (id, map, x, y, face, sight, level, step, name, lk, intro, lose) =>
  ({ id, map, x, y, face, sight, look: lk, student: { name, level, step, intro, lose } });

export const PEOPLE = [
  { id: "durwin", map: "lab", x: 8, y: 3, face: "down", look: DURWIN },
  { id: "riona", map: "town", x: 3, y: 5, face: "right", look: look("#e8e8e8", "#a050a0", "#504060") },
  { id: "ennio", map: "town", x: 10, y: 7, face: "left", look: look("#f0f0e0", "#f0b030", "#604020") },
  { id: "rival", map: "town", x: 9, y: 4, face: "left", sight: 1, look: RIVAL.look },
  student("callie", "garden", 6, 5, "right", 2, 0, 0, "CALLIE", look("#e8a030", "#e070a0", "#404858"),
    "I'm modelling rabbit growth for my JGSOM case study. Help me forecast month 6?", "Eight pairs! My professor will love this projection."),
  student("toby", "garden", 10, 3, "down", 1, 0, 1, "TOBY", look("#402818", "#50a070", "#303840"),
    "I was supposed to be studying, but these flower spirals are more interesting. What comes next?", "Twenty-one, thirty-four, fifty-five. Nice!"),
  student("chloe", "hive", 6, 5, "right", 2, 1, 0, "CHLOE", look("#202020", "#f0d040", "#5a4630"),
    "I made a rule about the bees. Can you find the one cell that would break it?", "Only p true and q false. Got it!"),
  student("ethan", "hive", 10, 3, "down", 1, 1, 1, "ETHAN", look("#704020", "#d05030", "#303840"),
    "Everyone mixes up the converse and the contrapositive. Do you?", "Buzz! Contrapositive it is."),
  student("pau", "field", 6, 5, "right", 2, 2, 0, "PAU", look("#f0d060", "#60a0e0", "#404858"),
    "I'm doing a stats project on Gonzaga lunch prices. Help me pick the right average?", "The median! That party tray was skewing everything."),
  student("zach", "field", 10, 3, "down", 1, 2, 1, "ZACH", look("#303030", "#a060c0", "#5a4630"),
    "Three stalls, same average wait. Same experience, right?", "Okay, the range tells the real story."),
];
const SPEAKERS = { "SIR DURWIN": DURWIN, RIONA: PEOPLE[1].look, ENNIO: PEOPLE[2].look, VENICE: look("#402818", "#e06080", "#304060"),
  [RIVAL.label]: RIVAL.look, ...Object.fromEntries(PEOPLE.filter((p) => p.student).map((p) => [`STUDENT ${p.student.name}`, p.look])) };
export const speakerLook = (label) => (CHARS[label] ? CHARS[label].look : SPEAKERS[label]);

// ---------- maps ----------
// 15 × 10 tiles of 16 px = 240 × 160, the GBA screen size.
// Outdoors: T tree · . grass · , tall grass (wild patterns) · = path · I sign · G V S Level entrances · L D lab and its door
//           X JSEC food stall · J Ikot jeep · Q q a Level's big (blocking) and small (walkable) decorations · E exit
// Indoors:  W wall · K bookshelf · A window · O floor · B table · R rug · E exit mat
const LEVEL_ROWS = [
  "TTTTTTTTTTTTTTT",
  "Tqq...,,,..qq.T",
  "Tq....,,,....qT",
  "T..QQQ........T",
  "T..QQQ..===...T",
  "T.......=.....T",
  "Tqq.....=...qqT",
  "T.......=.....T",
  "T.......=I....T",
  "TTTTTTTTETTTTTT",
];
const levelMap = (name, level, townX, sign) => ({ name, level, pal: ["garden", "hive", "field"][level], rows: LEVEL_ROWS,
  warps: { "8,9": { to: "town", x: townX, y: 2, dir: "down" } }, signs: { "9,8": sign } });
export const MAPS = {
  town: {
    name: "Ateneo de Manila", pal: "town",
    rows: [
      "TTTTTTTTTTTTTTT",
      "T..G....V....ST",
      "T..=....=I...=T",
      "T..===========T",
      "T,,....I=.....T",
      "T,,.....=..JJ.T",
      "TXX.LLL.=.....T",
      "TXX.LDL.=..,,.T",
      "T...====...,,.T",
      "TTTTTTTTTTTTTTT",
    ],
    warps: { "3,1": { to: "garden", x: 8, y: 8, dir: "up", level: 0 }, "8,1": { to: "hive", x: 8, y: 8, dir: "up", level: 1 },
             "13,1": { to: "field", x: 8, y: 8, dir: "up", level: 2 }, "5,7": { to: "lab", x: 7, y: 7, dir: "up" } },
    signs: { "7,4": "ATENEO DE MANILA. JGSOM (SOM 304) ↓ · Levels ↑ · One Big Fight!",
             "9,2": "← JGSOM GARDEN · LEONG HIVE ↑ · GONZAGA →" },
  },
  lab: {
    name: "SOM 304", pal: "lab",
    rows: [
      "WWWWWWWWWWWWWWW",
      "WKKKKAAAAAKKKKW",
      "WOOOOOOOOOOOOOW",
      "WOOOBBBOOOOOOOW",
      "WOOOBBBOOOOOOOW",
      "WOOOOOOOOOOOOOW",
      "WOOOOOORROOOOOW",
      "WOOOOOORROOOOOW",
      "WWWWWWWEEWWWWWW",
      "WWWWWWWWWWWWWWW",
    ],
    warps: { "7,8": { to: "town", x: 5, y: 8, dir: "down" }, "8,8": { to: "town", x: 5, y: 8, dir: "down" } },
    signs: {},
  },
  garden: levelMap("JGSOM Garden", 0, 3, "JGSOM GARDEN. Even the rabbits here understand compound growth."),
  hive: levelMap("Leong Hive", 1, 8, "LEONG HIVE. Formerly Leong Hall. If you are a bee, then you may enter."),
  field: levelMap("Gonzaga", 2, 13, "GONZAGA. Where the average lunch costs more than the median one."),
};
export const HOME = { map: "lab", x: 8, y: 4, dir: "up" }; // right in front of Sir Durwin
export const SIGN_COUNT = Object.values(MAPS).reduce((n, m) => n + Object.keys(m.signs).length, 0);

// ---------- hidden notes (each comes with a Hint Potion) ----------
export const FACTS = [
  { id: "galileo", map: "town", x: 12, y: 8, text: "Galileo wrote that the book of nature is written in the language of mathematics." },
  { id: "petals", map: "garden", x: 7, y: 1, text: "Lilies have 3 petals, buttercups 5, and many daisies 21 or 34. Not every flower, but a lot of them land on Fibonacci numbers." },
  { id: "boole", map: "hive", x: 7, y: 1, text: "George Boole popularised using letters like p and q for statements, which makes logic short to write." },
  { id: "spread", map: "field", x: 7, y: 1, text: "Same mean, very different data: always check the spread (range or standard deviation) too." },
];

// ---------- dialogue ----------
export const INTRO_LINES = [
  "SIR DURWIN: Ah, you're here! Welcome to SOM 304, our classroom here in JGSOM.",
  "SIR DURWIN: I'm SIR DURWIN, but people call me the Pattern Professor.",
  "SIR DURWIN: Something strange is happening. The campus's patterns are getting scrambled!",
  "SIR DURWIN: Rabbit counts that don't add up, bees breaking their own rules, averages that lie...",
  "SIR DURWIN: Now, which of my three assistant Researchers is reporting for duty today?",
];
export const startLines = (name) => [
  CHARS[name].pick,
  `SIR DURWIN: Right! ${name}, take this FIELD NOTEBOOK. Every pattern you figure out gets recorded in it.`,
  "SIR DURWIN: Students are guarding the clues at three Levels north of town. Win their pattern battles and each Level's patterns will be restored.",
  "SIR DURWIN: Here's a HINT POTION too. Use it in battle when you're stuck.",
  "SIR DURWIN: Off you go! The door is just behind you.",
];
export const TALK = {
  durwin: [
    ["SIR DURWIN: Two students are waiting in the JGSOM Garden, up the path to the west.", "SIR DURWIN: Win both pattern battles to earn the Fibonacci Badge!"],
    ["SIR DURWIN: Splendid! The Garden's patterns are back. Two more students wait at Leong Hive, straight north."],
    ["SIR DURWIN: Two badges already! The last students are at Gonzaga to the north-east."],
  ],
  riona: [
    ["RIONA: My blockmate's pet rabbits multiply so fast. Each month is the last two months added together!"],
    ["RIONA: An if-then rule is only broken one way: the \"if\" happens, but the \"then\" doesn't."],
    ["RIONA: One huge value can drag the mean way up. The median barely moves."],
    ["RIONA: The campus patterns look right again. Gonzaga run to celebrate?"],
  ],
  ennio: [
    ["ENNIO: The JGSOM Garden people are counting rabbits. Very on-brand: it's all about growth."],
    ["ENNIO: I'm a Bio major. I look after the bees at Leong. Every honeybee cell is a hexagon, but not every hexagon is a honeybee cell!"],
    ["ENNIO: Thanks for unscrambling the hive! Over at Gonzaga, they're arguing about averages."],
    ["ENNIO: Thanks for unscrambling the hive!"],
  ],
};
export const STORE_LINES = {
  first: ["VENICE: Welcome to JSEC! The lunch rush is over, so I'm feeling generous.", "VENICE: Here, take a HINT POTION. Libre na! (It's free!)"],
  later: ["VENICE: Ingat! And don't skip lunch."],
};
export const JEEP_LINES = ["The IKOT jeep is parked here. It goes around campus forever, like a loop with no end condition."];
export const ENDING_LINES = ["Five plus three makes eight pairs. Well counted!", "Twenty-one plus thirty-four!", "A full, unsealed cell breaks the rule.",
  "The contrapositive always agrees.", "The median, not the mean.", "Same average, different spread.", "And the big picture: patterns follow rules."];

// ---------- reference ----------
export const GLOSSARY = [
  ["Fibonacci sequence", "1, 1, 2, 3, 5, 8, 13, … Each number after the first two is the sum of the two before it."],
  ["Statement", "A sentence that is either true or false, but not both. Questions and opinions are not statements."],
  ["Conditional (p → q)", "\"If p, then q.\" It is false only when p is true and q is false."],
  ["Converse, inverse, contrapositive", "For p → q: converse q → p, inverse ~p → ~q, contrapositive ~q → ~p. Only the contrapositive is always equivalent to p → q."],
  ["De Morgan's laws", "~(p ∧ q) is ~p ∨ ~q, and ~(p ∨ q) is ~p ∧ ~q."],
  ["Mean, median, mode", "Mean: sum ÷ count. Median: the middle of the sorted data. Mode: the most frequent value. The mean is sensitive to outliers."],
  ["Range and standard deviation", "Measures of spread. Range = highest − lowest; the standard deviation is about how far values are from the mean on average."],
  ["Golden angle", "About 137.5°. A sunflower turns by this angle between one seed and the next, which makes Fibonacci numbers of spirals."],
  ["Polya's four steps", "Understand the problem, devise a plan, carry out the plan, and look back. The Hints follow these steps."],
];
export const ACHIEVEMENTS = {
  first: ["First entry", "Win your first battle."],
  perfectSite: ["Perfect Level", "Get both Steps right on the first try at one Level."],
  reader: ["Bookworm", "Read every sign."],
  explorer: ["Explorer", "Find all four hidden notes."],
  rival: ["Rival rumble", "Beat Xander three times."],
  wild: ["Into the grass", "Win five wild battles."],
  speed: ["Quick thinker", "Score 8 or more in a speed battle."],
  unshaken: ["Unshaken", "Finish the game without blacking out."],
  perfect: ["Perfect run", "Finish with every Step right on the first try."],
};
