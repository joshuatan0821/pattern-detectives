# Game design

Capitalised terms (Level, Step, Battle, Hint, ...) are defined in [GLOSSARY.md](../GLOSSARY.md). The game plays like an old Game Boy Advance Pokémon game: a small world to walk around, students who challenge you to Battles, and Badges to earn.

## Story

Something is scrambling the patterns of **Barangay Maligaya**: lopsided butterflies, floors full of gaps, sunflowers that lost count. **Sir Durwin**, the Pattern Professor at the Field Station, sends one of his three assistant Researchers (the player picks **Chippy, Bryce, or Joshua**) to the three Levels north of town. Students at each Level guard the clues. Winning their Battles earns the Level's Badge and restores its patterns. With all three Badges, the Researcher returns to Sir Durwin for the Conclusion, he reads through their Field Notebook with them, and the run ends in the Hall of Fame.

All dialogue is in `game/js/content.js`. Filipino touches: the sari-sari store and its tindera, a jeepney, Lola, and a few Tagalog greetings (*Magandang araw*, *Salamat*, *Ingat*).

## World

The world is a set of 15 × 10 tile maps (the GBA's 240 × 160 screen):

| Map | What's there |
| --- | --- |
| Field Station (lab) | Sir Durwin. The game opens here and the Conclusion Battle happens here |
| Barangay Maligaya (town) | Lab, sari-sari store (a free Hint Potion), jeepney, Lola and the beekeeper (Hints for the current Level), signs, rival Jamie, tall grass |
| The Garden, The Beehive, The Sunflower Field | Two students each, a sign, tall grass with a hidden note. Each looks "scrambled" (greyed) until its Badge is earned |

- Walk with the arrow keys/WASD, or click or tap a tile to walk there. Enter talks to whoever you face.
- Level entrances are locked until the Badge before them is earned.
- Students see along a line in front of them. Walk into their sight and they spot you ("!") and start a Battle.
- **Tall grass** can start a wild Battle with a practice question. **Hidden notes** in the grass add a fact to the Notebook and a Hint Potion.
- **Jamie**, the rival, appears in town once after each Badge for a two-question Battle.

## Levels

Levels go from the easiest pattern to notice to the hardest. Each Level has two Steps, one per student.

| # | Level | Mathematics | Student 1 (Step 1) | Student 2 (Step 2) |
| --- | --- | --- | --- | --- |
| 1 | The Garden | Symmetry: reflection and rotation | Mia: complete the butterfly | Leo: the missing snowflake arm (60°) |
| 2 | The Beehive | Tessellations | Ana: which polygon tiles with no gap | Raf: why hexagons fit (3 × 120° = 360°) |
| 3 | The Sunflower Field | Fibonacci sequence, golden ratio | Joy: the next spiral count | Kit: ratios approach about 1.618 |
| — | Conclusion | Math as a science of patterns | Sir Durwin: what the three patterns share | |

The Step texts and the Step format are in [docs/puzzles/README.md](puzzles/README.md).

## Battles

1. **Start**: a white flash, the student says a line, then sends out the pattern. The pattern's Figure is the opponent, and the four Options are the move menu (click, or arrow keys and Enter).
2. **Rounds**: a student Battle has two rounds. Round 1 is the student's Step from the JSON files. Round 2 is a practice question generated from the same Level's rules (`game/js/questions.js`). Only round 1 counts for the Score and the Notebook.
3. **HP**: the Researcher has 3 HP per Battle. A wrong Option costs 1 HP, is crossed out, and its `whyWrong` is shown right away. At 0 HP the Researcher blacks out and the Battle restarts with the Options reshuffled. A Step can only be lost by trying every Distractor.
4. **Hints** follow Polya's steps. The first wrong answer shows *Understand*, and the second shows *Plan* and highlights the key part of the Figure in red. A **Hint Potion** from the Bag shows the next Hint without losing HP.
5. **Try it**: some Steps have a hands-on version of the Figure to explore before answering: flip the wing, turn the snowflake, add tiles around a corner, trace the sunflower's 21 and 34 spirals.
6. **Win**: "Reflection is super effective!" The pattern fades into the Field Notebook, and the Explanation page shows the animation or extra Figures, *Look back*, *Why it matters*, notes on any Distractors chosen, and the source.
7. Winning both students' Battles earns the Badge, shows the Level's stars (★ per first-try Step), and offers a quick trip back to the Field Station.

An optional setting asks "Use this answer?" before each pick, to protect HP from misclicks. It's on by default.

## Figures

Figures are drawn on the Canvas by code that follows each pattern's exact rule: mirroring for the butterfly wing, 60° rotation for the snowflake, regular polygons for the tilings, the golden angle for the sunflower seeds. Bryce checks the rules. A Step's data names which Figure to draw and with what settings, so a wrong Option can be the same Figure with a deliberate mistake.

## Score and rewards

- **Score**: how many of the seven Steps were answered correctly on the first try, shown in the Hall of Fame ("5 of 7 on the first try").
- **Stars** per Level, a **first-try streak** counter, and nine **Achievements** (kept across runs).
- A perfect run (7 of 7) unlocks a **golden hat** for every later run.

## Screens

| Screen | Contents |
| --- | --- |
| Title | New game, Continue (3 save slots), Speed battle, Demo mode, Achievements, Controls, Settings, Playtest data |
| Menu (Esc) | Field Notebook, Badges, Town map, Achievements, Settings, Controls, Save, Quit to title |
| Field Notebook | Recorded Steps (with Battle again for practice), hidden notes, glossary |
| Ending | Sir Durwin turns through the notebook, then the Hall of Fame and rolling credits |
| Speed battle | As many practice questions as possible in 60 seconds |
| Demo mode | Jump to any Level or the final Battle for the live presentation. Demo runs are not saved and earn nothing |
| Playtest data | Per Step: times solved, first-try rate, median time, and which wrong Options were picked, with a Copy button for the report |

## Saving

Three save slots in the browser's local storage. The game saves after each Battle, Badge, door, and from the menu. Settings, Achievements, the golden hat, and playtest stats are shared across slots.

## Audio

Placeholder chiptune sounds are made in code (text blips, hits, the battle flash, victory and Badge jingles). Adrian's music and effects replace them later. Volume, mute (M), and text speed are in Settings. Browsers only allow sound after the player interacts, so audio starts with the first button press.

## Accessibility

- Readable sans-serif text for questions, dialogue, and the Notebook. The pixel font is used only for titles and labels
- Larger text and text speed settings, and hold X to fast-forward
- Figures have text descriptions for screen readers, and the dialogue box is announced as it changes
- Figures never rely on colour alone (gaps, labels, and line styles carry the meaning)
- Keyboard, mouse, and touch all work. Phones get a portrait layout with on-screen arrows and A/B buttons

## Play-time budget

| Part | Time |
| --- | --- |
| Opening scene and walking | ~2 min |
| 6 student Battles × ~2 min (two rounds, Hints, Explanation) | ~12 min |
| Rival, wild Battles, notes (optional) | ~3 min |
| Conclusion, ending, Hall of Fame | ~2 min |
| **Total** | **~19 min** (15–25) |

Measure real times during playtesting with the Playtest data screen.

## Out of scope

Timers that end a Step in the main game, accounts or log-in, difficulty settings, and more than three Levels.
