# Pattern Keepers

A short single-player puzzle game about mathematical patterns, language, and reasoning, made for **MATH 10 Mathematics in the Modern World** (Section M2, 1st Semester SY 2026–2027, Durwin C. Santos, M.S.).

An Apprentice in a Philippine weaving village must restore a Loom whose pattern has been lost. The three Rooms of the Weaving House are locked, and each door opens only when the Apprentice solves the Room's three Puzzles. After every Puzzle, an Explanation shows why the answer is correct, so the game teaches the mathematics it uses.

| Room | Theme | Math as |
| --- | --- | --- |
| 1. The Weaver's Hall | Number patterns, Fibonacci and the golden ratio, symmetry, tessellations | a science of patterns |
| 2. The Vault of Symbols | Sets, logical connectives, quantifiers, translating statements | a language |
| 3. The Master Weaver's Study | Inductive and deductive reasoning, counterexamples, truth tables, Polya's four steps | a tool for reasoning and decisions |

About 15 minutes of play. Runs in any modern desktop or phone browser.

## Team

| Member | Role |
| --- | --- |
| Bryce Go | Mathematics lead and writer |
| Joshua Tan | Game developer |
| Adrian "Chippy" Wong | Art, audio, and documentation lead |

## Repository layout

```
GLOSSARY.md            the words we use for things in the game (read this first)
CONTRIBUTING.md        how each of us adds work to this repo
docs/
  game-design.md       story, Rooms, the Puzzle cycle, screens
  puzzles/README.md    topic map and how to write a Puzzle
  art-direction.md     motifs, palette, screen size, asset rules
  schedule.md          timetable and owners
  adr/                 records of decisions that are hard to undo
game/
  data/room-N.json     the Puzzles themselves (the only copy)
  assets/              images and audio used by the game
scripts/
  check-puzzles.mjs    checks every Puzzle file is complete
```

## Running it locally

The game is plain HTML, CSS, and JavaScript with no build step. Open the `game/` folder with a local web server (for example VS Code's **Live Server** extension, or `npx serve game`) and open the page it prints. Opening `index.html` directly from the file system will not work, because browsers block JavaScript modules loaded that way.

To check the Puzzle files:

```bash
node scripts/check-puzzles.mjs
```

The same check runs automatically on every pull request.

## Use of generative AI

In line with the course policy on GenAI use: generative AI helped brainstorm project topics and organize the project proposal. An AI coding assistant also helped draft these planning documents and set up this repository. All design decisions and mathematical content were reviewed and decided by the group.

## References

- Stewart, I. (2017). The beauty of numbers in nature. MIT Press. https://mitpressbookstore.mit.edu/book/9780262534284 
- Devlin, K. (2000). Prologue: What is mathematics? In The language of mathematics: Making the invisible visible (pp. 1-12). W. H. Freeman and Co. https://plus.maths.org/content/language-mathematics
- Hales, T. C. (2001). The honeycomb conjecture. Discrete & Computational Geometry, 25(1), 1-22. https://doi.org/10.1007/s004540010071 
- Knott, R. (n.d.). Fibonacci numbers and nature. University of Surrey. https://r-knott.surrey.ac.uk/Fibonacci/fibnat.html  


