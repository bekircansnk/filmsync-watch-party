## 2026-07-25 - Sidebar Injection Reflow Optimization
**Learning:** Animating layout properties (like `width` and `right`) forces the browser to recalculate layouts for the entire document on every frame (reflow), causing heavy main-thread contention and dropped frames during video playback.
**Action:** Switched layout-triggering properties (`right`, `transition: all`, `transition: width`) to GPU-accelerated ones (`transform`, `opacity`, etc.) in the sidebar injection. Removed the `width` transition from the page body completely.
