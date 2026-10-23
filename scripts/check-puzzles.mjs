// Checks that every Step in game/data/level-N.json and conclusion.json is complete.
// It checks structure only; the mathematics still needs a human review.
// Usage: node scripts/check-puzzles.mjs

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OPTIONS_PER_STEP = 4;

const files = [
  { file: "game/data/level-1.json", level: 1, stepCount: 2, stepId: (n) => `l1s${n}` },
  { file: "game/data/level-2.json", level: 2, stepCount: 2, stepId: (n) => `l2s${n}` },
  { file: "game/data/level-3.json", level: 3, stepCount: 2, stepId: (n) => `l3s${n}` },
  { file: "game/data/conclusion.json", level: null, stepCount: 1, stepId: () => "conclusion" },
];

const errors = [];
const warnings = [];

const isText = (value) => typeof value === "string" && value.trim() !== "";

function checkFigure(figure, where) {
  if (figure === undefined || figure === null) return;
  if (typeof figure !== "object" || !isText(figure.type)) {
    errors.push(`${where}: "figure" needs a "type"`);
  }
}

for (const { file, level, stepCount, stepId } of files) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(root, file), "utf8"));
  } catch (err) {
    errors.push(`${file}: cannot be read as JSON (${err.message})`);
    continue;
  }

  if (level !== null) {
    if (data.level !== level) errors.push(`${file}: "level" should be ${level}`);
    if (!isText(data.setting)) errors.push(`${file}: "setting" is missing`);
  }
  if (!isText(data.name)) errors.push(`${file}: "name" is missing`);
  if (!Array.isArray(data.steps)) {
    errors.push(`${file}: "steps" should be a list`);
    continue;
  }

  if (data.steps.length > stepCount) {
    errors.push(`${file}: has ${data.steps.length} Steps; expected ${stepCount}`);
  } else if (data.steps.length < stepCount) {
    warnings.push(`${file}: has ${data.steps.length} of ${stepCount} Steps so far`);
  }

  data.steps.forEach((step, index) => {
    const expectedId = stepId(index + 1);
    const where = `${file} ${isText(step.id) ? step.id : `Step ${index + 1}`}`;

    if (step.id !== expectedId) errors.push(`${where}: "id" should be "${expectedId}"`);
    for (const field of ["topic", "question", "hint", "explanation"]) {
      if (!isText(step[field])) errors.push(`${where}: "${field}" is missing`);
    }
    checkFigure(step.figure, where);

    const options = step.options;
    if (!Array.isArray(options) || options.length !== OPTIONS_PER_STEP) {
      errors.push(`${where}: needs exactly ${OPTIONS_PER_STEP} Options`);
      return;
    }

    const correctCount = options.filter((option) => option.correct === true).length;
    if (correctCount !== 1) errors.push(`${where}: needs exactly one correct Option (found ${correctCount})`);

    const texts = new Set();
    options.forEach((option, optionIndex) => {
      const label = `${where} Option ${optionIndex + 1}`;
      const hasFigure = option.figure !== undefined && option.figure !== null;

      if (!isText(option.text) && !hasFigure) errors.push(`${label}: needs "text", a "figure", or both`);
      if (isText(option.text)) {
        if (texts.has(option.text.trim())) errors.push(`${label}: same text as another Option`);
        texts.add(option.text.trim());
      }
      checkFigure(option.figure, label);

      if (option.correct === true) {
        if (option.whyWrong !== undefined) errors.push(`${label}: the correct Option should not have "whyWrong"`);
      } else if (!isText(option.whyWrong)) {
        errors.push(`${label}: Distractor needs a "whyWrong" note`);
      }
    });
  });
}

for (const warning of warnings) console.log(`warning: ${warning}`);
for (const error of errors) console.log(`error:   ${error}`);

if (errors.length > 0) {
  console.log(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log("All Step files are well-formed.");
