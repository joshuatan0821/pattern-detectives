# Pattern Detectives

A short single-player puzzle game about **mathematics as a science of patterns**, made for **MATH 10 Mathematics in the Modern World** (Section M2, 1st Semester SY 2026–2027).

The player is an assistant Researcher who studies patterns in nature. Each Level is built around one natural pattern, starting easy and getting harder. After every answer, an Explanation shows the reasoning, so the player learns the mathematics behind each pattern while playing. To win, the Researcher works out what all three patterns have in common.

| Level | Setting | Mathematics |
| --- | --- | --- |
| 1. The Garden | Butterfly wings and snowflakes | Symmetry: reflection and rotation |
| 2. The Beehive | Honeycomb | Tessellations |
| 3. The Sunflower Field | Sunflowers, pinecones, and shells | Number patterns, the Fibonacci sequence, the golden ratio |

Plays in a desktop or phone browser from a link. We're aiming for up to 30 minutes of play, and our current estimate is 10–15 minutes; playtesting will tell.

## Team

| Member | Role |
| --- | --- |
| Bryce Go | Mathematics lead and writer |
| Joshua Tan | Game developer |
| Adrian Wong | Art, audio, and documentation lead |

## Repository layout

```
GLOSSARY.md              the words we use for things in the game (read this first)
CONTRIBUTING.md          how each of us adds work to this repo
docs/
  game-design.md         story, Levels, the Step cycle, screens
  puzzles/README.md      topic map and how to write a Step
  art-direction.md       look, screen size, asset rules
  schedule.md            timetable and owners
  adr/                   records of decisions that are hard to undo
game/
  data/level-N.json      the Steps of each Level (the only copy)
  data/conclusion.json   the final Conclusion Step
  assets/                backgrounds, interface art, and audio
scripts/
  check-puzzles.mjs      checks every Step is complete
```

## Running it locally

The game is plain JavaScript with HTML5 Canvas and no build step. Open the `game/` folder with a local web server (for example VS Code's **Live Server** extension, or `npx serve game`) and open the page it prints. Opening `index.html` directly from the file system will not work, because browsers block JavaScript modules loaded that way.

To check the Step files:

```bash
node scripts/check-puzzles.mjs
```

The same check runs automatically on every pull request.

## Use of generative AI

In line with the course policy on GenAI use: an AI coding assistant helped draft these planning documents. All design decisions and mathematical content were reviewed and decided by the group.

## References

- Devlin, K. (2000). Prologue: What is mathematics? In *The language of mathematics: Making the invisible visible* (pp. 1–12). W. H. Freeman and Co. https://plus.maths.org/content/language-mathematics
- Hales, T. C. (2001). The honeycomb conjecture. *Discrete & Computational Geometry, 25*(1), 1–22. https://doi.org/10.1007/s004540010071
- Knott, R. (n.d.). *Fibonacci numbers and nature*. University of Surrey. https://r-knott.surrey.ac.uk/Fibonacci/fibnat.html
- Stewart, I. (2017). *The beauty of numbers in nature*. MIT Press. https://mitpressbookstore.mit.edu/book/9780262534284
