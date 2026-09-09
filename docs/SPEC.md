# Rainbow Merge 🌈🦄

A tiny 2D puzzle game for the JS13K jam (theme: **Rainbows and Unicorns**). It plays like the classic 2048, but instead of merging numbers, players merge **colors**. Sliding two matching color tiles together promotes them to the next color of the rainbow. Complete the full rainbow spectrum and the tile transforms into a glorious **Unicorn** — the ultimate win tile.

The entire game must be **as tiny as possible** (aiming for the JS13K < 13KB zipped budget) and use **zero external libraries**. This makes an **HTML5 Canvas App** the ideal choice: it's compact, dependency-free, gives us pixel-level control over the color tiles and animations, and avoids the overhead of a framework.

## App Type

**HTML5 Canvas App** — a single self-contained `.html` file with inline `<style>` and `<script>`. No frameworks, no fonts, no images, no external assets. All colors, tiles, and effects are drawn procedurally on a canvas for maximum byte efficiency.

## Core Concept

- A 4×4 grid (standard 2048 board).
- Tiles are glossy pastel candy gems with distinct symbols instead of numbers.
- Merging two identical colors advances them along a **nine-step Rainbow Journey**: Red, Orange, Yellow, Green, Cyan, Blue, Purple, Rainbow, and Unicorn.
- Two Rainbow tiles merge into the ultimate **Unicorn** tile. Unicorns are terminal tiles and cannot merge further.
- Each color has a distinct candy-gem symbol. The unicorn uses shared procedural artwork in the board, journey, header, and celebration.

## UI Elements

### Header Bar
- Compact top strip showing the game title "🌈 Rainbow Merge" on the left.
- **Score** display (points gained from each merge) and a **Best** score (persisted via `localStorage`) on the right.
- Keep text minimal — a single system font (`font-family: sans-serif`) to save bytes.

### Game Board
- A centered square canvas containing the 4×4 grid, with a beveled candy-glass frame and recessed lavender slots.
- Glossy rounded gems with depth, highlights, shadows, and a distinct symbol for each color.
- Sliding tiles retain their source color until the merge lands, squash together, then bounce with a glow ring and particles. Higher tiers produce more particles; Purple and above emit rainbow colors.
- The **Unicorn tile** has a pearlescent rainbow finish, a soft animated glow, and custom unicorn artwork.

### Controls / Instructions
- A compact restart icon beside the score and personal best, with a New Game tooltip and accessible name.
- A **Rainbow Journey** beneath the board shows all nine named gems, highlighting the current highest color and its step count.
- Multiple merges in one move or consecutive merging moves show brief combo feedback. Combos of five or more, or combos that produce Rainbow or Unicorn, show "RAINBOW COMBO!".

### Win / Game Over Overlay
- The first Unicorn triggers a large full-screen rainbow/unicorn animation with waves of rainbow confetti, stars, and sparkles, followed by a "Hello, little unicorn!" dialog. Keep Going resumes without repeating the win celebration; New Game resets all pending animations and timers.
- Reduced-motion preferences suppress squash, bounce, and particles while preserving progress, combo feedback, and the win dialog. Dialogs manage keyboard focus and pause board input.
- When no moves remain: a "Game Over" overlay with final score and a "Try Again" button.

### Footer
- A minimal footer line with the remix link: `<a href="/remix">Remix on Berrry</a>`.

## Controls & Functionality

- **Keyboard:** Arrow keys (and WASD) slide tiles in the four directions.
- **Touch:** Swipe gestures (up/down/left/right) for mobile play, detected via touchstart/touchend deltas.
- **Merge logic:** Standard 2048 sliding — tiles move fully in the chosen direction, adjacent equal colors merge once per move, a new low-color tile (mostly Red, occasionally Orange) spawns after each valid move.
- **Scoring:** Each merge adds points scaled to the resulting color's rank; total and best score update live.
- **Persistence:** Best score and (optionally) current board state saved to `localStorage` so progress survives refresh.
- **Win condition:** Producing the ninth-step Unicorn tile triggers the win state; game can continue for a higher score when legal moves remain.
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