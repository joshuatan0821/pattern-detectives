# Art direction

Owner: Adrian "Chippy" Wong. Everything here is a starting point for Adrian to change.

## Look and feel

The Weaving House should feel warm and handmade, drawing on real Filipino weaving traditions such as:

- **T'nalak** of the T'boli (South Cotabato): abaca cloth with dream-inspired geometric designs
- **Inabel** of the Ilocos region: cotton weaves with repeating bands such as the *binakol* whirlwind pattern
- **Yakan** weaving of Basilan: bright, tightly repeating geometric motifs

Each Room can lean on a different tradition so the three Rooms look distinct. Record which tradition and which reference images inspired each piece in [game/assets/CREDITS.md](../game/assets/CREDITS.md). This supports our "math in the world" claims and the documentation deliverable.

Keep claims accurate. Symmetry and tessellation can be shown in woven designs. Fibonacci and the golden ratio are shown with things from nature (sunflowers, shells, pinecones), not in weaving.

## Screen

- Designed at **1280 × 720**, landscape. The game scales this to fit the window.
- Leave the bottom third of Puzzle screens clear enough for 3–4 Option buttons.
- Text sits on solid or softly blurred panels so it stays readable on phones.

## Asset list

| Asset | Format | Notes |
| --- | --- | --- |
| Title screen background | PNG | |
| One background per Room (×3) | PNG | |
| Ending: restored Loom | PNG | |
| Puzzle images (r1p2 woven design, r1p3 polygons, others as needed) | **SVG** preferred | Must stay sharp at any size; shapes must be geometrically exact |
| Option button, panel, mute icon | SVG or PNG | |
| Music loop | MP3 or OGG | ~1–2 min, loops cleanly |
| Sound effects: correct, wrong, door | MP3 or OGG | Under 2 seconds each |

## File rules

- Game-ready files go in `game/assets/images/` and `game/assets/audio/`.
- File names in lowercase with dashes, e.g. `room-1-background.png`, `r1p2-design.svg`.
- Keep each file under ~1 MB. Export PNGs at the size they're shown, not larger.
- Don't commit large working files (e.g. `.psd`, `.kra`); keep those on your own drive.
- Every file that is not 100% our own work gets a line in `CREDITS.md`: source, author, license.
