# Game design

Terms in **bold capitals** (Room, Puzzle, Hint, ...) are defined in [GLOSSARY.md](../GLOSSARY.md).

## Story

The Apprentice arrives at the Weaving House to find the great Loom silent: the pattern it held has been lost. The pattern is hidden in the house, one thread per Room, and each Room's door opens only for someone who understands its mathematics.

Story text is kept short:

- **Intro**: 3–4 lines before Room 1.
- **Door line**: one line each time a Room's door opens.
- **Ending**: the restored Loom weaves its pattern, with 1–2 closing lines.

Final wording lives in `game/data/story.json` (to be written during storyboarding).

## Rooms

| # | Room | Math as | Puzzle 1 | Puzzle 2 | Puzzle 3 |
| --- | --- | --- | --- | --- | --- |
| 1 | The Weaver's Hall | Pattern | Fibonacci sequence | Symmetry in a woven design | Regular polygons that tessellate |
| 2 | The Vault of Symbols | Language | English statement → symbols | Truth of a quantified statement | Intersection of two sets of clues |
| 3 | The Master Weaver's Study | Tool | Inductive or deductive? | Counterexample to "all primes are odd" | Missing row of the p → q truth table |

Topics without their own Puzzle are taught in Explanations and Hints, so that every topic in the proposal appears in the game. The full topic map is in [docs/puzzles/README.md](puzzles/README.md).

## The Puzzle cycle

1. The Puzzle shows a question, an optional image, and 3–4 Options in shuffled order.
2. **Wrong Option**: the Option is greyed out and the player tries again. There is no penalty.
3. **Second wrong attempt**: the Hint appears automatically. There is no Hint button.
4. **Correct Option**: the Explanation screen shows why the correct Option is right, and for each Distractor the player chose, why it was wrong.
5. After the Room's third Puzzle, the door line plays and the next Room opens.

There is no score, timer, or lives.

## Screens

| Screen | Contents |
| --- | --- |
| Title | Game name, **Start**, **Continue** (only if there is saved progress), **Start over**, mute toggle |
| Intro | The 3–4 story lines, then into Room 1 |
| Puzzle | Room name, Puzzle number (1–3), question, image, Options, Hint when shown, mute toggle |
| Explanation | Why the answer is right, notes on chosen Distractors, **Next** |
| Door | The door line, then into the next Room |
| Ending | The restored Loom, closing lines, **Play again** |

## Progress

The browser remembers the furthest Room unlocked. **Continue** resumes at the start of that Room, and **Start over** clears it. This also lets us jump straight to Room 3 during the live demo.

## Audio

- One looping music track
- Three sound effects: correct, wrong, door opens
- A mute toggle on every screen

Browsers only allow sound after the player interacts, so audio starts when **Start** or **Continue** is pressed.

## Display

- Landscape, designed at 1280 × 720 and scaled to fit the window
- Works with mouse and touch (the game only needs clicks and taps)
- English text, with the Filipino names of weaving traditions where they appear

## Play-time budget

| Part | Time |
| --- | --- |
| Intro and title | ~1 min |
| 9 Puzzles × ~1.5 min (including Explanation) | ~13.5 min |
| Door lines and ending | ~1 min |
| **Total** | **~15 min** |

## Out of scope

Scoring, timers, a Hint button, accounts or log-in, difficulty settings, and more than three Rooms.
