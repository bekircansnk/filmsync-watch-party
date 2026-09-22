## 2026-09-22 - Remove Sidebar Width Transition
**Learning:** Applying CSS transitions to layout-altering properties like `width` on high-frequency streaming platforms (Netflix, Disney+, YouTube) causes severe DOM reflow overhead. This results in frame drops and performance degradation during video playback when injecting and toggling extensions' UIs.
**Action:** Removed the `transition: width 0.3s ease;` rule from `body.filmsync-sidebar-open` in `extension/content.js` to ensure instantaneous dimension updates and maintain high-frame-rate video playback.
