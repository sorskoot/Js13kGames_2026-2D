# Rainbow Merge 🌈🦄

A tiny 2D puzzle game for the JS13K jam (theme: **Rainbows and Unicorns**). It plays like the classic 2048, but instead of merging numbers, players merge **colors**. Sliding two matching color tiles together promotes them to the next color of the rainbow. Complete the full rainbow spectrum and the tile transforms into a glorious **Unicorn** — the ultimate win tile.

The entire game must be **as tiny as possible** (aiming for the JS13K < 13KB zipped budget) and use **zero external libraries**. This makes an **HTML5 Canvas App** the ideal choice: it's compact, dependency-free, gives us pixel-level control over the color tiles and animations, and avoids the overhead of a framework.

## App Type

**HTML5 Canvas App** — a single self-contained `.html` file with inline `<style>` and `<script>`. No frameworks, no fonts, no images, no external assets. All colors, tiles, and effects are drawn procedurally on a canvas for maximum byte efficiency.

## Core Concept

- A 4×4 grid (standard 2048 board).
- Tiles are solid color swatches instead of numbers.
- Merging two identical colors advances them one step along a **10-color progression**.
- The base rainbow order is: **Red → Orange → Yellow → Green → Blue → Violet**, extended to 10 distinct colors so the ramp feels satisfying (e.g. Red, Orange, Yellow, Chartreuse/Lime, Green, Teal/Cyan, Blue, Indigo, Violet/Purple, and finally the **Unicorn** tile as color #10).
- Reaching the 10th step yields a **Unicorn tile** (drawn with a simple procedural sparkle/unicorn glyph) = the win condition.

## UI Elements

### Header Bar
- Compact top strip showing the game title "🌈 Rainbow Merge" on the left.
- **Score** display (points gained from each merge) and a **Best** score (persisted via `localStorage`) on the right.
- Keep text minimal — a single system font (`font-family: sans-serif`) to save bytes.

### Game Board
- A centered square canvas containing the 4×4 grid.
- Rounded-rectangle tiles with soft drop shadows drawn on the canvas.
- Empty cells rendered as faint translucent slots.
- Each tile shows its color as a filled rounded square; optionally a tiny label/number of the color index for accessibility, kept subtle.
- Smooth **slide and merge animations** (tiles lerp to their new positions; merged tiles do a quick "pop" scale bounce).
- The **Unicorn tile** gets special treatment: an animated rainbow gradient fill plus a simple sparkle/star glyph so it clearly reads as the win tile.

### Controls / Instructions
- Below the board: a one-line hint — "Swipe or use arrow keys to merge colors up the rainbow!"
- A small **New Game** button (rounded, subtle) to reset the board.
- Optional **legend/progress strip** showing the 10-color ramp so players understand the target order, with the current highest achieved color subtly highlighted.

### Win / Game Over Overlay
- When a Unicorn is created: a celebratory overlay ("🦄 You made a Unicorn!") with a "Keep Going" and "New Game" option, plus a burst of confetti/sparkle particles drawn on canvas.
- When no moves remain: a "Game Over" overlay with final score and a "Try Again" button.

### Footer
- A minimal footer line with the remix link: `<a href="/remix">Remix on Berrry</a>`.

## Controls & Functionality

- **Keyboard:** Arrow keys (and WASD) slide tiles in the four directions.
- **Touch:** Swipe gestures (up/down/left/right) for mobile play, detected via touchstart/touchend deltas.
- **Merge logic:** Standard 2048 sliding — tiles move fully in the chosen direction, adjacent equal colors merge once per move, a new low-color tile (mostly Red, occasionally Orange) spawns after each valid move.
- **Scoring:** Each merge adds points scaled to the resulting color's rank; total and best score update live.
- **Persistence:** Best score and (optionally) current board state saved to `localStorage` so progress survives refresh.
- **Win condition:** Producing the 10th-step Unicorn tile triggers the win state; game can continue for a higher score.
- **Lose condition:** Board full with no possible merges triggers game over.

## Styling Preferences

- Clean, playful, whimsical aesthetic fitting the "Rainbows and Unicorns" theme.
- Soft pastel page background with a subtle rainbow gradient accent to set the mood — kept lightweight (CSS gradient, no images).
- Rounded corners, gentle shadows, and satisfying pop animations for a juicy feel.
- Single sans-serif system font, emoji used sparingly (🌈🦄✨) for flavor without adding asset weight.
- Fully responsive: the canvas scales to fit the viewport (square aspect maintained) so it plays well on phones and desktops alike.
- Prioritize **tiny code size** everywhere: short variable names in the shipped build, procedural drawing instead of assets, no external fonts/libraries, and a single self-contained HTML file.

## Additional Notes / Whimsy

- Little sparkle particles trail merges to reinforce the magical vibe.
- The color ramp names could appear as a fun tooltip ("Chartreuse? Fancy!").
- Keep the whole experience delightful, instantly playable, and shareable — a bite-sized rainbow-chasing puzzle you can pick up in seconds.

Build a **complete, working, self-contained HTML5 Canvas game** implementing all of the above, with no external dependencies.