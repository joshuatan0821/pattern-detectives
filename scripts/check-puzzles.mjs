// Checks that every Puzzle in game/data/room-N.json is complete.
// It checks structure only; the mathematics still needs a human review.
// Usage: node scripts/check-puzzles.mjs

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gameDir = join(root, "game");
const PUZZLES_PER_ROOM = 3;

const errors = [];
const warnings = [];

const isText = (value) => typeof value === "string" && value.trim() !== "";

for (const roomNumber of [1, 2, 3]) {
  const file = `game/data/room-${roomNumber}.json`;
  let room;
  try {
    room = JSON.parse(readFileSync(join(root, file), "utf8"));
  } catch (err) {
    errors.push(`${file}: cannot be read as JSON (${err.message})`);
    continue;
  }

  if (room.room !== roomNumber) errors.push(`${file}: "room" should be ${roomNumber}`);
  if (!isText(room.name)) errors.push(`${file}: "name" is missing`);
  if (!Array.isArray(room.puzzles)) {
    errors.push(`${file}: "puzzles" should be a list`);
    continue;
  }

  if (room.puzzles.length > PUZZLES_PER_ROOM) {
    errors.push(`${file}: has ${room.puzzles.length} Puzzles; a Room has ${PUZZLES_PER_ROOM}`);
  } else if (room.puzzles.length < PUZZLES_PER_ROOM) {
    warnings.push(`${file}: has ${room.puzzles.length} of ${PUZZLES_PER_ROOM} Puzzles so far`);
  }

  room.puzzles.forEach((puzzle, index) => {
    const expectedId = `r${roomNumber}p${index + 1}`;
    const where = `${file} ${isText(puzzle.id) ? puzzle.id : `Puzzle ${index + 1}`}`;

    if (puzzle.id !== expectedId) errors.push(`${where}: "id" should be "${expectedId}"`);
    for (const field of ["topic", "question", "hint", "explanation"]) {
      if (!isText(puzzle[field])) errors.push(`${where}: "${field}" is missing`);
    }

    if (puzzle.image !== undefined && puzzle.image !== null) {
      if (!isText(puzzle.image)) errors.push(`${where}: "image" should be a file name`);
      else if (!existsSync(join(gameDir, "assets", puzzle.image))) {
        errors.push(`${where}: image "${puzzle.image}" not found in game/assets/`);
      }
    }

    const options = puzzle.options;
    if (!Array.isArray(options) || options.length < 3 || options.length > 4) {
      errors.push(`${where}: needs 3 or 4 Options`);
      return;
    }

    const correctCount = options.filter((option) => option.correct === true).length;
    if (correctCount !== 1) errors.push(`${where}: needs exactly one correct Option (found ${correctCount})`);

    const texts = new Set();
    options.forEach((option, optionIndex) => {
      const label = `${where} Option ${optionIndex + 1}`;
      if (!isText(option.text)) errors.push(`${label}: "text" is missing`);
      else if (texts.has(option.text.trim())) errors.push(`${label}: same text as another Option`);
      else texts.add(option.text.trim());

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
console.log("All Puzzle files are well-formed.");
