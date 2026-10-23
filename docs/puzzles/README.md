# Writing Steps

The Steps live **only** in `game/data/level-1.json`, `level-2.json`, `level-3.json`, and `conclusion.json`. The game reads those files directly, so what you write there is exactly what players see. Do not keep a second copy anywhere else (see [ADR 0002](../adr/0002-puzzles-live-only-in-json.md)).

## Topic map

| Level | Step | Topic | Also taught (in the Explanation) |
| --- | --- | --- | --- |
| 1 The Garden | l1s1 | Reflection symmetry: complete the missing half of a butterfly wing | Line of symmetry; mirror images in living things |
| | l1s2 | Rotational symmetry: the missing arm of a six-fold (60°) snowflake | 360° ÷ 6 = 60°; why ice crystals have six arms |
| 2 The Beehive | l2s1 | Which regular polygon tiles a floor without gaps (triangle, square, hexagon; not pentagon) | Tessellation; interior angles |
| | l2s2 | Why hexagons fit: three 120° corners make 360° | Honeycomb conjecture: hexagons divide space with the least wall (Hales, 2001) |
| 3 The Sunflower Field | l3s1 | Count the spirals on a sunflower and find the next Fibonacci number | Fibonacci sequence; spirals in pinecones (Knott) |
| | l3s2 | Ratios 8/5, 13/8, 21/13 approach about 1.618 | Golden ratio φ = (1 + √5) / 2; shells |
| Conclusion | conclusion | What the three patterns have in common | Math as a science of patterns (Devlin, 2000) |

Every topic named in the proposal is covered: number sequences, the Fibonacci sequence, the golden ratio, symmetry, and tessellations.

## Level file format

```json
{
  "level": 1,
  "name": "The Garden",
  "setting": "Butterfly wings and snowflakes",
  "steps": [ ...two Steps... ]
}
```

`conclusion.json` has `"name": "Conclusion"` and a `steps` list holding a single Step with `"id": "conclusion"`.

Each Step has:

| Field | What to write |
| --- | --- |
| `id` | `l<level>s<step>`, e.g. `l1s1`; or `conclusion` |
| `topic` | The topic from the map above |
| `question` | What the player is asked |
| `figure` | Optional. The Figure shown with the question: `{ "type": "<figure name>", ...settings }`. Joshua lists the available Figure types as he builds them |
| `options` | Exactly **4** Options. Each has `text`, a `figure`, or both. Exactly one has `"correct": true`; every other Option is a Distractor and needs a `whyWrong` |
| `hint` | One or two sentences that point the way without giving the answer away |
| `explanation` | Why the correct Option is right, in a few sentences |

Use Unicode for math symbols, not LaTeX: ° × ÷ ≈ ≠ φ √ ½.

## A complete example

This shows the format. Bryce writes and owns the real Steps.

```json
{
  "id": "l3s1",
  "topic": "Fibonacci sequence",
  "question": "This sunflower has 21 spirals turning one way and 34 turning the other. Bigger sunflowers follow the same pattern. How many spirals would the next size up have?",
  "figure": { "type": "sunflower", "spiralsA": 21, "spiralsB": 34 },
  "options": [
    { "text": "55", "correct": true },
    { "text": "68", "whyWrong": "68 doubles 34. The pattern adds the two numbers before instead." },
    { "text": "47", "whyWrong": "47 adds 13 to 34, as if the jump from 21 to 34 repeats. The jumps grow each time." },
    { "text": "35", "whyWrong": "35 counts up by one, as if the spirals were the counting numbers. They grow much faster." }
  ],
  "hint": "Look at how each number in 1, 1, 2, 3, 5, 8, 13, 21, 34 relates to the two before it.",
  "explanation": "Each Fibonacci number is the sum of the two before it, so 21 + 34 = 55. Sunflower spirals almost always come in neighbouring Fibonacci numbers, such as 21 and 34, or 34 and 55. The same thing happens in pinecones and pineapples."
}
```

## Checking

1. **Format check**: run `node scripts/check-puzzles.mjs`, or just open a pull request, where it runs automatically. It catches missing fields, a missing comma, or not exactly one correct Option. It does **not** check the mathematics.
2. **Mathematical check**: every Step pull request needs approval from a second member, who re-solves each Step and reads every `whyWrong`, Hint, and Explanation against the course materials. Bryce also checks that each Figure's settings give a mathematically exact pattern.
