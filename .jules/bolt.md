## 2026-09-05 - Optimize DOM Reflow for Sidebar Injection
**Learning:** Animating layout-triggering CSS properties like `width` on high-load DOM elements (like video players) causes severe main-thread blocking and frame drops.
**Action:** Removed `transition: width 0.3s ease;` from the `body.filmsync-sidebar-open` selector in `extension/content.js` to ensure the sidebar injection executes instantly without reflow animation overhead.
