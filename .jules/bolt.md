## 2026-07-22 - Layout Reflow Bottleneck Elimination

**Learning:** Changing properties like `width` or `right` on persistent layout components (`body`, `#filmsync-mini-toolbar`) using transitions triggers slow frame-by-frame DOM reflows across the page, causing significant video lag on platforms like Netflix and YouTube. Generic `transition: all` also degrades performance when hover events occur.

**Action:** Removed `transition: width 0.3s ease;` from `body.filmsync-sidebar-open` to allow instant layout snapping. Refactored `#filmsync-mini-toolbar` to use GPU-accelerated `transform: translateX()` instead of manipulating the `right` CSS property. Replaced all generic `transition: all` usage with targeted CSS transitions and added `will-change` hints for compositing optimization.
