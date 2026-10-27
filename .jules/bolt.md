## 2024-03-24 - Inline short-circuit check vs Centralized validation
**Learning:** Refactoring an inline short-circuit cache check (e.g., `cachedElement || findElement()`) into a centralized, stricter cache validation inside the lookup function improves code correctness (by preventing stale references) but does not constitute a performance improvement, as the original short-circuit already bypassed the expensive operation.
**Action:** When acting under the 'Bolt' persona, ensure the optimization actually reduces computation or execution overhead. Do not mistake correctness fixes for performance optimizations if the execution time is not improved.

## 2024-03-24 - DOM Reflow Optimization
**Learning:** To minimize DOM reflow overhead and dropped frames during video playback when resizing layouts (e.g., sidebars adjusting video player width), apply `contain: layout !important;` and `will-change: width, max-width !important;` to the targeted video player containers (like those on Netflix, Disney+, and YouTube). This instructs the browser to isolate layout changes and prepare for width modifications. Also ensure `transition: none !important;` is used on these containers to prevent animated layout shifts.
**Action:** Use these CSS properties when making layout adjustments that cause costly reflows to improve browser rendering performance.
