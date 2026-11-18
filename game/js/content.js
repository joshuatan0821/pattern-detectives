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
export const BADGES = ["Fibonacci Badge", "Hexagon Badge", "Golden Ratio Badge"];

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
  label: "RIVAL JAMIE", look: { hat: "#5040a0", shirt: "#40a0a0", pants: "#283040" },
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
  { id: "lola", map: "town", x: 3, y: 5, face: "right", look: look("#e8e8e8", "#a050a0", "#504060") },
  { id: "beekeeper", map: "town", x: 10, y: 7, face: "left", look: look("#f0f0e0", "#f0b030", "#604020") },
  { id: "rival", map: "town", x: 9, y: 4, face: "left", sight: 1, look: RIVAL.look },
  student("mia", "garden", 6, 5, "right", 2, 0, 0, "MIA", look("#e8a030", "#e070a0", "#404858"),
    "I'm counting rabbit pairs for my project. Help me guess month 6?", "One, one, two, three, five, eight. Got it!"),
  student("leo", "garden", 10, 3, "down", 1, 0, 1, "LEO", look("#402818", "#50a070", "#303840"),
    "Count the spirals on my flower. What comes next?", "Twenty-one, thirty-four, fifty-five. Nice!"),
  student("ana", "hive", 6, 5, "right", 2, 1, 0, "ANA", look("#202020", "#f0d040", "#5a4630"),
    "My floor has a gap in it. Which tile fixes it?", "No gaps, no overlaps. Nice!"),
  student("raf", "hive", 10, 3, "down", 1, 1, 1, "RAF", look("#704020", "#d05030", "#303840"),
    "The bees told me a secret about angles. Do you know it?", "Buzz! You cracked the honeycomb."),
  student("joy", "field", 6, 5, "right", 2, 2, 0, "JOY", look("#f0d060", "#60a0e0", "#404858"),
    "Let's divide some Fibonacci numbers. Ready?", "1.618... I'll never forget it now."),
  student("kit", "field", 10, 3, "down", 1, 2, 1, "KIT", look("#303030", "#a060c0", "#5a4630"),
    "I saw a video that says the golden ratio is the secret of beauty. True?", "Okay, I'll stop drawing rectangles on everything."),
];
const SPEAKERS = { "SIR DURWIN": DURWIN, LOLA: PEOPLE[1].look, BEEKEEPER: PEOPLE[2].look, TINDERA: look("#402818", "#e06080", "#304060"),
  [RIVAL.label]: RIVAL.look, ...Object.fromEntries(PEOPLE.filter((p) => p.student).map((p) => [`STUDENT ${p.student.name}`, p.look])) };
export const speakerLook = (label) => (CHARS[label] ? CHARS[label].look : SPEAKERS[label]);

// ---------- maps ----------
// 15 × 10 tiles of 16 px = 240 × 160, the GBA screen size.
// Outdoors: T tree · . grass · , tall grass (wild patterns) · = path · I sign · G V S Level entrances · L D lab and its door
//           X sari-sari store · J jeepney · Q q a Level's big (blocking) and small (walkable) decorations · E exit
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
    name: "Barangay Maligaya", pal: "town",
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
    signs: { "7,4": "BARANGAY MALIGAYA. Field Station ↓ · Levels ↑ · Mabuhay!",
             "9,2": "← THE GARDEN · THE BEEHIVE ↑ · THE SUNFLOWER FIELD →" },
  },
  lab: {
    name: "Field Station", pal: "lab",
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
  garden: levelMap("The Garden", 0, 3, "THE GARDEN. Count the rabbits, then count the petals."),
  hive: levelMap("The Beehive", 1, 8, "THE BEEHIVE. Count the corners where the cells meet."),
  field: levelMap("The Sunflower Field", 2, 13, "THE SUNFLOWER FIELD. Divide, then check the claim."),
};
export const HOME = { map: "lab", x: 8, y: 4, dir: "up" }; // right in front of Sir Durwin
export const SIGN_COUNT = Object.values(MAPS).reduce((n, m) => n + Object.keys(m.signs).length, 0);

// ---------- hidden notes (each comes with a Hint Potion) ----------
export const FACTS = [
  { id: "galileo", map: "town", x: 12, y: 8, text: "Galileo wrote that the book of nature is written in the language of mathematics." },
  { id: "petals", map: "garden", x: 7, y: 1, text: "Lilies have 3 petals, buttercups 5, and many daisies 21 or 34. Not every flower, but a lot of them land on Fibonacci numbers." },
  { id: "wax", map: "hive", x: 7, y: 1, text: "Bees use honey to make wax, so building with less wall saves them food." },
  { id: "pinecone", map: "field", x: 7, y: 1, text: "Pinecones and pineapples show spiral counts like 8 and 13: neighbouring Fibonacci numbers." },
];

// ---------- dialogue ----------
export const INTRO_LINES = [
  "SIR DURWIN: Ah, you're here! Welcome to the Field Station of Barangay Maligaya.",
  "SIR DURWIN: I'm SIR DURWIN, but people call me the Pattern Professor.",
  "SIR DURWIN: Something strange is happening. The barangay's patterns are getting scrambled!",
  "SIR DURWIN: Rabbit counts that don't add up, floors full of gaps, golden rectangles drawn on everything...",
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
    ["SIR DURWIN: Two students are waiting in the Garden, up the path to the west.", "SIR DURWIN: Win both pattern battles to earn the Fibonacci Badge!"],
    ["SIR DURWIN: Splendid! The Garden's patterns are back. Two more students wait at the Beehive, straight north."],
    ["SIR DURWIN: Two badges already! The last students are in the Sunflower Field to the north-east."],
  ],
  lola: [
    ["LOLA: Magandang araw, anak! My rabbits multiply so fast. Each month is the last two added together!"],
    ["LOLA: The bees never leave gaps. Count the corners where their cells meet."],
    ["LOLA: Some say the golden ratio is the secret of beauty. Hmp! Check the claim before you believe it."],
    ["LOLA: Salamat, anak. The barangay's patterns look right again!"],
  ],
  beekeeper: [
    ["BEEKEEPER: The Garden students are counting rabbits and petals."],
    ["BEEKEEPER: My bees fit three cells around every corner. Neat, huh?"],
    ["BEEKEEPER: Thanks for unscrambling the hive! The sunflower field is all about 1.618."],
    ["BEEKEEPER: Thanks for unscrambling the hive!"],
  ],
};
export const STORE_LINES = {
  first: ["TINDERA: Magandang araw! Welcome to the sari-sari store.", "TINDERA: Here, take a HINT POTION. Libre na! (It's free!)"],
  later: ["TINDERA: Ingat! Take care out there."],
};
export const JEEP_LINES = ["A jeepney is parked here. Its sign says MALIGAYA – BAYAN."];
export const ENDING_LINES = ["Five plus three makes eight pairs. Well counted!", "Twenty-one plus thirty-four!", "No gaps, no overlaps.",
  "Three corners, 360 degrees.", "The golden ratio, about 1.618.", "And a claim checked, not just believed.", "And the big picture: patterns follow rules."];

// ---------- reference ----------
export const GLOSSARY = [
  ["Regular polygon", "A polygon whose sides are all equal and whose angles are all equal."],
  ["Interior angle", "The angle inside a polygon at one corner. In a regular polygon with n sides, each one is (n − 2) × 180° ÷ n."],
  ["Tessellation", "A covering of a flat surface by shapes, with no gaps and no overlaps."],
  ["Fibonacci sequence", "1, 1, 2, 3, 5, 8, 13, … Each number after the first two is the sum of the two before it."],
  ["Golden ratio (φ)", "φ = (1 + √5) ÷ 2 ≈ 1.618. Ratios of neighbouring Fibonacci numbers get closer and closer to it."],
  ["Golden rectangle", "A rectangle whose long side ÷ short side is φ. Cut a square off it and a smaller golden rectangle is left."],
  ["Golden angle", "About 137.5°. A sunflower turns by this angle between one seed and the next, which makes Fibonacci numbers of spirals."],
  ["Polya's four steps", "Understand the problem, devise a plan, carry out the plan, and look back. The Hints follow these steps."],
];
export const ACHIEVEMENTS = {
  first: ["First entry", "Win your first battle."],
  perfectSite: ["Perfect Level", "Get both Steps right on the first try at one Level."],
  reader: ["Bookworm", "Read every sign."],
  explorer: ["Explorer", "Find all four hidden notes."],
  rival: ["Rival rumble", "Beat Jamie three times."],
  wild: ["Into the grass", "Win five wild battles."],
  speed: ["Quick thinker", "Score 8 or more in a speed battle."],
  unshaken: ["Unshaken", "Finish the game without blacking out."],
  perfect: ["Perfect run", "Finish with every Step right on the first try."],
};
