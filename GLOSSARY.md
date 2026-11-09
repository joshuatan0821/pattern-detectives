# Pattern Detectives

A short single-player puzzle game for MATH 10 (Mathematics in the Modern World) about mathematics as a science of patterns. An assistant Researcher studies patterns in nature, one Level at a time, and finally works out what they all have in common.

## World

**Researcher**:
The player character, an assistant researcher who observes patterns in nature.
_Avoid_: Detective, apprentice, hero, user

**Figure**:
A picture of a natural pattern (a butterfly wing, a snowflake, a tiling, a sunflower spiral) drawn exactly according to its mathematical rule, shown in a Step or as an Option.
_Avoid_: Image, sprite, drawing

## Structure

**Level**:
One of the three places the Researcher visits (The Garden, The Beehive, The Sunflower Field), each built around one natural pattern and its mathematics; Levels go from easiest to hardest.
_Avoid_: Room, stage, area

**Puzzle**:
The investigation at the heart of a Level, made of a short chain of Steps.
_Avoid_: Question, challenge

**Step**:
One question within a Puzzle, with exactly four Options.
_Avoid_: Question, sub-puzzle, quiz item

**Conclusion**:
The final Step after the last Level, where the Researcher identifies what the patterns of all three Levels have in common.
_Avoid_: Final boss, finale, Level 4

**Option**:
One of the four answer choices in a Step; exactly one is correct.
_Avoid_: Choice, answer button

**Distractor**:
An incorrect Option written to reflect a specific common mistake.
_Avoid_: Wrong answer, decoy

**Hint**:
A short nudge toward the correct Option, following Polya's steps: *Understand* after the first wrong attempt, *Plan* (with the key part of the Figure highlighted) after the second. A Hint Potion shows the next Hint early.
_Avoid_: Clue, tip

**Explanation**:
The screen shown after a Step is solved, saying why the correct Option is right and why any Distractor the Researcher chose was wrong.
_Avoid_: Solution screen, feedback, answer key

**Score**:
The number of Steps answered correctly on the first try, shown at the end of the game.
_Avoid_: Points, grade, accuracy

## Play

**Battle**:
How a Step is played: a student (or Sir Durwin) sends out the pattern, and the Researcher answers with one of the four Options as a move.
_Avoid_: Fight, quiz

**Student**:
A character who challenges the Researcher to a Battle. Each Level has two, one per Step.
_Avoid_: Trainer, enemy

**HP**:
The Researcher's 3 hit points in a Battle. A wrong Option costs 1; at 0 the Battle restarts.
_Avoid_: Lives, health

**Badge**:
Earned by winning both student Battles at a Level; it unlocks the next Level.
_Avoid_: Medal, trophy

**Field Notebook**:
Where solved Steps are recorded with their Explanations, plus hidden notes and the glossary.
_Avoid_: Pokédex, journal

**Practice question**:
A question generated from a Level's rules (in `game/js/questions.js`), used for second rounds, the rival, wild Battles, and the speed battle. It never counts toward the Score.
_Avoid_: Bonus Step, random question

**Hint Potion**:
A bag item that shows the next Hint without costing HP.
_Avoid_: Power-up
