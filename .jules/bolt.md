
## 2026-07-19 - Minimize DOM Reflow Overhead
 **Learning:** Animating the `width` property on the document body or video player containers causes continuous layout thrashing during the transition, leading to severe DOM reflow overhead and dropped frames (jank) during high-frame-rate video playback on platforms like Netflix, Disney+, and YouTube.
 **Action:** Removed the `transition: width 0.3s ease;` rule from the `body.filmsync-sidebar-open` class in `extension/content.js` to ensure the layout instantly snaps to its new dimensions. Added comments explaining the optimization.
