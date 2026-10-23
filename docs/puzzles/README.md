# Writing Puzzles

The Puzzles live **only** in `game/data/room-1.json`, `room-2.json`, and `room-3.json`. The game reads those files directly, so what you write there is exactly what players see. Do not keep a second copy anywhere else (see [ADR 0002](../adr/0002-puzzles-live-only-in-json.md)).

## Topic map

Every topic named in the proposal must appear somewhere: either as a Puzzle, or inside an Explanation or Hint.

| Room | Puzzle | Main topic | Also taught here |
| --- | --- | --- | --- |
| 1 The Weaver's Hall | r1p1 | Fibonacci sequence (number patterns) | Golden ratio and Fibonacci in nature (Explanation) |
| | r1p2 | Symmetry in a woven design (reflection, rotation, translation) | Symmetry in Filipino weaving (Explanation) |
| | r1p3 | Which regular polygons tessellate | Tessellations in floors and weaving (Explanation) |
| 2 The Vault of Symbols | r2p1 | Translating an English statement into symbols | Logical connectives ¬ ∧ ∨ → ↔ |
| | r2p2 | Deciding if a quantified statement is true | Quantifiers ∀ ∃ |
| | r2p3 | Intersection of two sets of clues | Sets and set operations |
| 3 The Master Weaver's Study | r3p1 | Inductive or deductive argument | |
| | r3p2 | Counterexample to "all prime numbers are odd" | Counterexamples disprove "for all" statements |
| | r3p3 | Missing row of the p → q truth table | Conditional statements, truth tables |
| | (all) | | Polya's four steps shape the Hints in Room 3 |

Where a claim is about the real world, keep it to what the sources support: Fibonacci and the golden ratio are shown **in nature**, while symmetry and tessellation are shown **in Filipino woven designs**.

## Puzzle format

Each room file looks like this:

```json
{
  "room": 1,
  "name": "The Weaver's Hall",
  "puzzles": [ ...three Puzzles... ]
}
```

Each Puzzle has:

| Field | What to write |
| --- | --- |
| `id` | `r<room>p<number>`, e.g. `r1p1` |
| `topic` | The main topic from the map above |
| `question` | What the player is asked |
| `image` | Optional. A file in `game/assets/images/`, e.g. `"images/r1p2-design.svg"` |
| `options` | 3 or 4 Options. Exactly one has `"correct": true`. Every other Option is a Distractor and needs a `whyWrong` |
| `hint` | One or two sentences that point the way without giving the answer away |
| `explanation` | Why the correct Option is right, in a few sentences |

Use Unicode for math symbols, not LaTeX: ¬ ∧ ∨ → ↔ ∀ ∃ ∈ ∉ ∩ ∪ ⊆ ∅ φ ≈ ≠ ≤ ≥ √.

## A complete example

```json
{
  "id": "r1p1",
  "topic": "Fibonacci sequence",
  "question": "The first rows of the old pattern were woven with 1, 1, 2, 3, 5, and 8 threads. How many threads go in the next row?",
  "options": [
    { "text": "13", "correct": true },
    { "text": "16", "whyWrong": "16 doubles the last row (8 × 2). The pattern adds the two rows before instead." },
    { "text": "11", "whyWrong": "11 adds 3 to the last row, as if the jump from 5 to 8 repeats. The jumps are not constant." }
  ],
  "hint": "Look at how each row relates to the two rows just before it.",
  "explanation": "Each number is the sum of the two before it: 5 + 8 = 13. This is the Fibonacci sequence. Divide each term by the one before (8 ÷ 5 = 1.6, 13 ÷ 8 = 1.625) and the ratios get closer and closer to the golden ratio φ ≈ 1.618, the same ratio seen in the spirals of sunflower seeds and pinecones."
}
```

## Checking

1. **Format check**: run `node scripts/check-puzzles.mjs`, or just open a pull request, where it runs automatically. It catches missing fields, a missing comma, or zero/two correct Options. It does **not** check the mathematics.
2. **Mathematical check**: every Puzzle pull request needs approval from a second member, who re-solves each Puzzle and reads every Distractor note and Explanation against the course materials.
