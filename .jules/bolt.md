## 2026-10-01 - Remove sidebar width transition to minimize DOM reflow
**Learning:** Animating `width` via CSS transitions triggers layout/reflow calculations on every frame, which can cause significant jank and frame drops on heavy media pages. Removing the transition forces a single instantaneous reflow, preserving high-framerate playback.
**Action:** Removed `transition: width 0.3s ease;` from `body.filmsync-sidebar-open` in `extension/content.js`, while keeping `width: calc(100% - 270px)` to ensure media players correctly recalculate their dimensions.
