# Puzzles live only in the game's JSON files

Puzzle text is written directly in `game/data/room-N.json`, which the game loads, rather than in Markdown documents that the developer copies into code. With a single copy, the mathematical check reviews exactly what players will see, and the two can never drift apart. The cost is that the mathematics lead edits JSON instead of prose. We soften this with a filled-in example and an automatic format check on every pull request.
