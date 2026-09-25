
## 2026-09-25 - Optimize Sidebar Resizing
**Learning:** Applying CSS transition to layout-altering properties like `width` on the body or video player containers when toggling injected extension UIs causes severe DOM reflow overhead, degrading frame-rates on streaming platforms.
**Action:** Removed `transition: width 0.3s ease;` from `body.filmsync-sidebar-open` to use instantaneous dimension updates instead.
