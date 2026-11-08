// Practice questions generated from exact rules. They fill the second round of student battles, the rival,
// wild patterns, practice replays, and the speed battle. Bryce should check these templates like any Step.
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffled = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
const deg = (x) => `${Number.isInteger(x) ? x : x.toFixed(1)}°`;
const cap = (s) => s[0].toUpperCase() + s.slice(1);
export const POLY = { 3: "triangle", 4: "square", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon", 9: "nonagon", 10: "decagon", 12: "dodecagon" };
const corner = (n) => ((n - 2) * 180) / n;

function make(base, correct, candidates) { // keep the first three Distractors that differ from the answer and each other
  const used = new Set([correct]), wrong = [];
  for (const [text, whyWrong] of candidates) if (!used.has(text) && wrong.length < 3) { used.add(text); wrong.push({ text, whyWrong }); }
  return { ...base, generated: true, options: [{ text: correct, correct: true }, ...wrong] };
}

function rotation() {
  const n = pick([3, 4, 5, 6, 8, 9, 10, 12]), a = 360 / n;
  return make({ foe: "SPIN FLAKE", topic: "Rotational symmetry", effect: "Rotation is super effective!",
    question: `This flake has ${n} evenly spaced arms. What is the smallest turn that lands it on itself?`,
    figure: { type: "snowflake", arms: n, missing: 0 },
    hint: `Share a full turn, 360°, equally between the ${n} arms.`,
    explanation: `${n} arms share a full turn, so 360° ÷ ${n} = ${deg(a)}.` },
  deg(a), [
    [deg(360 / (n - 1)), `That's 360° ÷ ${n - 1}. Count all ${n} arms.`],
    [deg(360 / (n + 1)), `That's 360° ÷ ${n + 1}, one arm too many.`],
    [deg(a / 2), "That's only half of the turn from one arm to the next."],
    ["360°", "A full turn always works, but a smaller turn already lands it on itself."],
    [deg(a * 2), "That skips an arm. The smallest turn moves each arm to the very next one."],
  ]);
}
function mirrorLines() {
  const n = pick([3, 4, 5, 6, 8]);
  return make({ foe: "MIRROR GEM", topic: "Reflection symmetry", effect: "Reflection is super effective!",
    question: `How many lines of symmetry does a regular ${POLY[n]} have?`, figure: { type: "polygon", sides: n },
    hint: "A line of symmetry folds the shape exactly onto itself. Try one through each corner.",
    explanation: `A regular polygon with ${n} sides has ${n} lines of symmetry. ` + (n % 2
      ? "Each one goes through a corner and the middle of the opposite side."
      : "Half go through opposite corners and half through the middles of opposite sides.") },
  `${n}`, [
    [`${2 * n}`, "That counts each line twice, once at each end."],
    [`${n - 1}`, `One short. A regular ${POLY[n]} has one line for every side.`],
    ["1", "A regular polygon folds onto itself in more than one way."],
    [`${n + 1}`, `One too many. A regular ${POLY[n]} has exactly as many lines as sides.`],
    ["0", "Every regular polygon has lines of symmetry."],
  ]);
}
function cornerAngle() {
  const n = pick([3, 4, 5, 6, 8, 9, 10, 12]), a = corner(n);
  return make({ foe: "POLYGON", topic: "Interior angles", effect: "Angle math is super effective!",
    question: `What is each inside corner angle of a regular ${POLY[n]}?`, figure: { type: "polygon", sides: n, angle: true },
    hint: `Use (n − 2) × 180° ÷ n with n = ${n}.`,
    explanation: `(${n} − 2) × 180° ÷ ${n} = ${deg(a)}.` },
  deg(a), [
    [deg(360 / n), "That's the turn you make at each corner walking around the outside, not the inside angle."],
    [deg((n - 2) * 180), `That's all ${n} corners added together. Divide by ${n}.`],
    [deg(((n - 1) * 180) / n), "Use (n − 2) × 180°, not (n − 1) × 180°."],
    ["180°", "Only a straight line makes 180°."],
    [deg(a + 15), "Close, but not exact. Work through (n − 2) × 180° ÷ n carefully."],
    [deg(a * 2), "That's two corners together."],
  ]);
}
function whichTiles() {
  const good = pick([3, 4, 6]), bad = shuffled([5, 7, 8, 9, 10, 12]).slice(0, 3);
  const why = (n) => { const a = corner(n), k = Math.floor(360 / a + 1e-9); return `Each ${POLY[n]} corner is ${deg(a)}. ${k} of them make ${deg(k * a)}, leaving a ${deg(360 - k * a)} gap.`; };
  return make({ foe: "FLOOR GAP", topic: "Tessellations", effect: "Tiling is super effective!",
    question: "Which regular polygon can tile a floor by itself, with no gaps or overlaps?", figure: { type: "tiles", sides: bad[0], hl: true },
    hint: "The corners meeting at a point must add up to exactly 360°.",
    explanation: `Each ${POLY[good]} corner is ${deg(corner(good))}, and ${360 / corner(good)} of them make exactly 360°.` },
  cap(POLY[good]), bad.map((n) => [cap(POLY[n]), why(n)]));
}
function nextTerm() {
  const a = rand(1, 6), t = [a, rand(a, a + 5)];
  while (t.length < 7) t.push(t.at(-1) + t.at(-2));
  const [, , , t3, prev, last, next] = t;
  return make({ foe: "NUMBER TRAIL", topic: "Fibonacci-style sequences", effect: "Fibonacci is super effective!",
    question: "Each number is the sum of the two before it. What comes next?", figure: { type: "sequence", terms: t.slice(0, 6) },
    hint: "Each number comes from adding the two numbers just before it.",
    explanation: `${prev} + ${last} = ${next}. It's the same rule as the Fibonacci sequence, with a different start.` },
  `${next}`, [
    [`${2 * last}`, "That doubles the last number. Add the two before it instead."],
    [`${last + t3}`, "That repeats the last jump. The jumps grow each time."],
    [`${last + 1}`, "That counts up by one. The numbers grow much faster."],
    [`${next + 1}`, "Close! Add the last two numbers again carefully."],
    [`${next - 1}`, "Close! Add the last two numbers again carefully."],
  ]);
}
function ratio() {
  const F = [1, 1];
  while (F.length < 14) F.push(F.at(-1) + F.at(-2));
  const k = rand(7, 12), a = F[k - 1], b = F[k];
  return make({ foe: "RATIO RAY", topic: "The golden ratio", effect: "The golden ratio is super effective!",
    question: `Which is closest to ${b} ÷ ${a}?`, figure: { type: "fraction", a, b },
    hint: `${a} and ${b} are neighbouring Fibonacci numbers. Their ratio is close to a famous number.`,
    explanation: `${b} ÷ ${a} ≈ ${(b / a).toFixed(3)}, very close to the golden ratio φ ≈ 1.618.` },
  "About 1.62", [
    ["About 1.5", "1.5 is 3 ÷ 2, an early ratio. Later ratios settle near 1.618."],
    ["About 2", `${b} is less than double ${a}, so the ratio is below 2.`],
    ["About 1.41", "That's √2, a different famous number."],
    ["About 1.75", `${a} × 1.75 = ${(a * 1.75).toFixed(2)}, which is bigger than ${b}.`],
  ]);
}

const BY_LEVEL = [[rotation, mirrorLines], [cornerAngle, whichTiles], [nextTerm, ratio]];
export function generate(level) {
  const pool = level >= 0 && level <= 2 ? BY_LEVEL[level] : BY_LEVEL.flat();
  return pick(pool)();
}
