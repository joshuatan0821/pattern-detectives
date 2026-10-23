# Game design

Capitalised terms (Level, Puzzle, Step, Hint, ...) are defined in [GLOSSARY.md](../GLOSSARY.md).

## Story

The player is an assistant Researcher sent out to study patterns in nature. At each site they observe one pattern closely and work out the rule behind it. After the third site, they compare their notes to find what all the patterns have in common.

Story text is kept short:

- **Intro**: 3–4 lines before Level 1.
- **Level intro**: one line when each Level begins, saying what the Researcher is there to study.
- **Ending**: 1–2 lines after the Conclusion, followed by the Score.

Final wording lives in `game/data/story.json` (to be written during storyboarding).

## Levels

Levels go from the easiest pattern to notice to the hardest. Each Level has one Puzzle, made of two Steps.

| # | Level | Setting | Mathematics | Step 1 | Step 2 |
| --- | --- | --- | --- | --- | --- |
| 1 | The Garden | Butterfly wings and snowflakes | Symmetry: reflection and rotation | Complete the missing half of a butterfly wing (reflection) | Find the missing arm of a snowflake with six-fold (60°) rotational symmetry |
| 2 | The Beehive | Honeycomb | Tessellations | Which regular polygon can tile a floor without gaps? | Why do hexagons fit? (three 120° corners make 360°) |
| 3 | The Sunflower Field | Sunflowers, pinecones, shells | Number patterns, Fibonacci sequence, golden ratio | Count the spirals on a sunflower and find the next Fibonacci number | Ratios of consecutive Fibonacci numbers (8/5, 13/8, 21/13) approach about 1.618 |
| — | Conclusion | All three | Math as a science of patterns | What do the butterfly, the honeycomb, and the sunflower have in common? | |

The full topic map and Step format are in [docs/puzzles/README.md](puzzles/README.md).

## The Step cycle

1. The Step shows a question, usually a Figure, and **four** Options in shuffled order. An Option may be text, a Figure, or both.
2. **Wrong Option**: the Option is greyed out and the player tries again. There is no penalty, beyond missing the first-try point for the Score.
3. **Hint**: appears automatically after **60 seconds** on the Step, or after **two wrong attempts**, whichever comes first. There is no Hint button.
4. **Correct Option**: the Explanation screen shows why the correct Option is right, and for each Distractor the player chose, why it was wrong.
5. After a Level's last Step, the next Level begins. After Level 3 comes the Conclusion, then the ending and the Score.

## Figures

Figures are drawn on the Canvas by code that follows each pattern's exact rule: mirroring for the butterfly wing, 60° rotation for the snowflake, regular polygons for the tilings, and Fibonacci numbers for the sunflower spirals. This keeps every Figure mathematically exact, and Bryce checks the rules. A Step's data names which Figure to draw and with what settings, so a wrong Option can be the same Figure with a deliberate mistake (e.g. a snowflake with five arms).

## Score

The Score counts how many of the seven Steps (six in the Levels plus the Conclusion) were answered correctly on the first try. It's shown on the ending screen, e.g. "5 of 7 on the first try." Nothing else depends on it.

## Screens

| Screen | Contents |
| --- | --- |
| Title | Game name, **Start**, **Continue** (only if there is saved progress), **Start over**, mute toggle |
| Intro | The 3–4 story lines, then into Level 1 |
| Level intro | Level name, setting, one line of story |
| Step | Level name, Step number, question, Figure, four Options, Hint when shown, mute toggle |
| Explanation | Why the answer is right, notes on chosen Distractors, **Next** |
| Conclusion | Same layout as a Step |
| Ending | Closing lines, the Score, **Play again** |

## Progress

The browser remembers the furthest Level reached. **Continue** resumes at the start of that Level, and **Start over** clears it. This also lets us jump straight to Level 3 during the live demo. The Score counts only Steps played in the current run.

## Audio

- One looping music track
- Three sound effects: correct, wrong, Level complete
- A mute toggle on every screen

Browsers only allow sound after the player interacts, so audio starts when **Start** or **Continue** is pressed.

## Display

- HTML5 Canvas for backgrounds and Figures, with text and buttons as HTML on top
- Landscape, designed at 1280 × 720 and scaled to fit the window
- Works with mouse and touch (the game only needs clicks and taps)
- English text

## Play-time budget

The proposal aims for up to 30 minutes. A realistic estimate for one Puzzle per Level:

| Part | Time |
| --- | --- |
| Title, intro, Level intros | ~2 min |
| 7 Steps × ~1.5 min (including Hint and Explanation) | ~10.5 min |
| Ending | ~0.5 min |
| **Total** | **~13 min** (10–15) |

Measure real times during playtesting and report them in the progress report and presentation.

## Out of scope

Timers that end a Step, lives, a Hint button, accounts or log-in, difficulty settings, and more than three Levels.
