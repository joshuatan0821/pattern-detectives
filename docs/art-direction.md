# Art direction

Owner: Adrian Wong. Everything here is a starting point for Adrian to change.

## Look and feel

A field researcher's notebook out in nature: soft natural colours, hand-drawn touches, and clean diagrams. Each Level should look clearly different:

| Level | Setting | Visual ideas |
| --- | --- | --- |
| The Garden | Butterfly wings and snowflakes | Flowers, butterflies, a frosty corner where snowflakes fall |
| The Beehive | Honeycomb | Warm golds and ambers, wax cells, bees |
| The Sunflower Field | Sunflowers, pinecones, shells | Tall sunflowers, pinecones on the ground, a shell on a path |

Base the art on real nature patterns. Use real photographs only if they are royalty-free, and credit them.

## Who draws what

- **Joshua (code)** draws the **Figures**: the butterfly wing, snowflake, tilings, and sunflower spiral used in questions and Options. They're generated from exact rules so the mathematics is always right.
- **Adrian** draws everything else: the title screen, the three Level backgrounds, the ending, and interface elements (panels, Option buttons, mute icon). Adrian also picks the colour palette that the Figures use, so code and art match.

## Screen

- Designed at **1280 × 720**, landscape. The game scales this to fit the window.
- Leave a clear area in the middle for the Figure and the bottom third for four Option buttons.
- Text sits on solid or softly blurred panels so it stays readable on phones.

## Asset list

| Asset | Format | Notes |
| --- | --- | --- |
| Title screen background | PNG | |
| One background per Level (×3) | PNG | |
| Ending background | PNG | |
| Option button, panel, mute icon | SVG or PNG | |
| Colour palette | List of hex codes | Shared with Joshua for the Figures |
| Music loop | MP3 or OGG | ~1–2 min, loops cleanly, royalty-free or original |
| Sound effects: correct, wrong, Level complete | MP3 or OGG | Under 2 seconds each |

## File rules

- Game-ready files go in `game/assets/images/` and `game/assets/audio/`.
- File names in lowercase with dashes, e.g. `level-1-background.png`.
- Keep each file under ~1 MB. Export PNGs at the size they're shown, not larger.
- Don't commit large working files (e.g. `.psd`, `.kra`); keep those on your own drive. Canva exports are fine.
- Every file that is not 100% our own work gets a line in `game/assets/CREDITS.md`: source, author, license.
