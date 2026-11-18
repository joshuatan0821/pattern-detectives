// Practice questions generated from exact rules. They fill the second round of student battles, the rival,
// wild patterns, practice replays, and the speed battle. Bryce should check these templates like any Step.
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffled = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
export const POLY = { 3: "triangle", 4: "square", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon", 9: "nonagon", 10: "decagon", 12: "dodecagon" };

function make(base, correct, candidates) { // keep the first three Distractors that differ from the answer and each other
  const used = new Set([correct]), wrong = [];
  for (const [text, whyWrong] of candidates) if (!used.has(text) && wrong.length < 3) { used.add(text); wrong.push({ text, whyWrong }); }
  return { ...base, generated: true, options: [{ text: correct, correct: true }, ...wrong] };
}

// ---------- Leong Hive: logic (Module 2) ----------
const PAIRS = [ // [p, q, ~p, ~q] about the campus
  ["a cell is full of honey", "it is sealed with wax", "a cell is not full of honey", "it is not sealed with wax"],
  ["it rains on campus", "the Ikot jeep is full", "it does not rain on campus", "the Ikot jeep is not full"],
  ["you study for the exam", "you pass the exam", "you do not study for the exam", "you do not pass the exam"],
  ["the stall is open", "there is a line", "the stall is not open", "there is no line"],
];
const cap1 = (t) => t[0].toUpperCase() + t.slice(1);
function falseCase() {
  const [p, q, np, nq] = pick(PAIRS);
  return make({ foe: "IF-THEN RULE", topic: "Conditionals", effect: "Logic is super effective!",
    question: `"If ${p}, then ${q}." Which situation makes this conditional FALSE?`,
    figure: { type: "logic", lines: [`p: ${cap1(p)}.`, `q: ${cap1(q)}.`, "p → q"] },
    hint: "A conditional is false in only one case: p is true and q is false.",
    explanation: `p → q is false only when p is true and q is false: ${p}, but ${nq}. In every other case the conditional is true.` },
  `${cap1(p)}, but ${nq}`, [
    [`${cap1(np)}, but ${q}`, "Here p is false. When p is false, the conditional is true no matter what q is."],
    [`${cap1(np)}, and ${nq}`, "Here p is false, so the conditional makes no claim and is true."],
    [`${cap1(p)}, and ${q}`, "Here p and q are both true, which agrees with the conditional."],
  ]);
}
function relatedForm() {
  const [p, q, np, nq] = pick(PAIRS), want = pick(["converse", "inverse", "contrapositive"]);
  const forms = { converse: `If ${q}, then ${p}.`, inverse: `If ${np}, then ${nq}.`, contrapositive: `If ${nq}, then ${np}.` };
  const sym = { converse: "q → p", inverse: "~p → ~q", contrapositive: "~q → ~p" };
  return make({ foe: "CONVERSE TRAP", topic: "Statements related to the conditional", effect: "Logic is super effective!",
    question: `Which is the ${want} of "If ${p}, then ${q}"?`,
    figure: { type: "logic", lines: [`p: ${cap1(p)}.`, `q: ${cap1(q)}.`, "p → q"] },
    hint: "Converse: swap p and q. Inverse: negate both. Contrapositive: swap AND negate.",
    explanation: `The ${want} is ${sym[want]}: "${forms[want]}" Only the contrapositive is always equivalent to the original conditional.` },
  forms[want], [
    ...Object.keys(forms).filter((k) => k !== want).map((k) => [forms[k], `That's the ${k}, ${sym[k]}.`]),
    [`If ${p}, then ${nq}.`, "That negates only the conclusion. It isn't one of the related statements."],
  ]);
}
function deMorgan() {
  const [x, y] = pick([["Sandy went to France", "Sandy went to Italy"], ["Chloe ate at Gonzaga", "Chloe ate at JSEC"], ["Toby took the Ikot jeep", "Toby walked"]]);
  const not = (t) => t.replace(/ (went|ate|took|walked)/, (m, v) => ` did not ${{ went: "go", ate: "eat", took: "take", walked: "walk" }[v]}`);
  const and = Math.random() < 0.5;
  return make({ foe: "DE MORGAN", topic: "Negation and De Morgan's laws", effect: "Logic is super effective!",
    question: `What is the negation of "${x} ${and ? "and" : "or"} ${y.split(" ").slice(1).join(" ")}"?`,
    figure: { type: "logic", lines: [`p: ${x}.`, `q: ${y}.`, and ? "~(p ∧ q)" : "~(p ∨ q)"] },
    hint: "De Morgan: the negation of \"and\" uses \"or\", and the negation of \"or\" uses \"and\".",
    explanation: and ? `~(p ∧ q) is ~p ∨ ~q: ${not(x)} or ${not(y)}.` : `~(p ∨ q) is ~p ∧ ~q: ${not(x)} and ${not(y)}.` },
  and ? `${not(x)} or ${not(y)}` : `${not(x)} and ${not(y)}`, [
    [and ? `${not(x)} and ${not(y)}` : `${not(x)} or ${not(y)}`, "Negating flips \"and\" and \"or\" (De Morgan's law)."],
    [`${x} ${and ? "or" : "and"} ${y}`, "This doesn't negate the parts. Each part needs a \"not\"."],
    [`${not(x)} ${and ? "and" : "or"} ${y}`, "Only one part is negated here."],
  ]);
}

// ---------- Gonzaga: statistics (Module 4) ----------
const r2 = (v) => String(+v.toFixed(2));
function centerQ() {
  const n = pick([5, 6, 7]), data = Array.from({ length: n }, () => rand(40, 120));
  const sorted = [...data].sort((a, b) => a - b), mean = data.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const kind = pick(["mean", "median"]), ans = kind === "mean" ? mean : median;
  return make({ foe: "AVERAGE", topic: "Measures of central tendency", effect: "Statistics is super effective!",
    question: `Lunch prices at Gonzaga (₱): ${data.join(", ")}. What is the ${kind}?`,
    figure: { type: "dotplot", sets: [{ name: "₱", values: data }] },
    hint: kind === "mean" ? "Add all the values, then divide by how many there are." : "Sort the values. Take the middle one, or the mean of the two middle ones.",
    explanation: kind === "mean" ? `Sum = ${data.reduce((a, b) => a + b, 0)}, and ${data.reduce((a, b) => a + b, 0)} ÷ ${n} = ${r2(mean)}.`
      : `Sorted: ${sorted.join(", ")}. The median is ${r2(median)}.` },
  r2(ans), [
    [r2(kind === "mean" ? median : mean), `That's the ${kind === "mean" ? "median" : "mean"}, not the ${kind}.`],
    [String(data[Math.floor(n / 2)]), "That's the middle of the list as written. Sort the values first."],
    [r2(data.reduce((a, b) => a + b, 0) / (n - 1)), `That divides by ${n - 1}. There are ${n} values.`],
    [String(sorted.at(-1) - sorted[0]), "That's the range, a measure of spread, not of center."],
    [r2(ans + 1), "Close! Check your arithmetic again."],
    [r2(ans - 1), "Close! Check your arithmetic again."],
  ]);
}
function rangeQ() {
  const data = Array.from({ length: pick([5, 6]) }, () => rand(10, 60)), hi = Math.max(...data), lo = Math.min(...data);
  return make({ foe: "SPREAD", topic: "Measures of dispersion", effect: "Statistics is super effective!",
    question: `Order times at a Gonzaga stall (seconds): ${data.join(", ")}. What is the range?`,
    figure: { type: "dotplot", sets: [{ name: "s", values: data }] },
    hint: "Range = highest value − lowest value.",
    explanation: `Highest ${hi} − lowest ${lo} = ${hi - lo}.` },
  String(hi - lo), [
    [String(hi), "That's just the highest value. Subtract the lowest."],
    [String(Math.abs(data.at(-1) - data[0])), "That uses the first and last values in the list. Use the highest and lowest."],
    [String(hi + lo), "Add? The range subtracts the lowest from the highest."],
    [String(hi - lo + 1), "Close! Subtract carefully: highest − lowest."],
  ]);
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
const BY_LEVEL = [[nextTerm], [falseCase, relatedForm, deMorgan], [centerQ, rangeQ]]; // Fibonacci, logic, statistics
export function generate(level) {
  const pool = level >= 0 && level <= 2 ? BY_LEVEL[level] : BY_LEVEL.flat();
  return pick(pool)();
}
