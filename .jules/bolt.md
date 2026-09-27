## 2026-09-27 - Optimize DOM reflow for video players
**Learning:** Applying CSS `transition` to layout-altering properties like `width` on the `body` or video player containers causes severe DOM reflow overhead during watch parties on streaming platforms, reducing frame rates.
**Action:** Removed `transition: width 0.3s ease;` from `body.filmsync-sidebar-open` to use instantaneous dimension updates instead.
