## 2026-09-27 - [Throttle Mouse Events on Fullscreen Player]
**Learning:** Attaching unthrottled `mousemove` and `keydown` events to the `document` (like in `setupFullscreenIdleDetector`) on heavy streaming sites (Netflix, Disney+) can cause severe main-thread jank and frame drops due to excessive DOM queries and `setTimeout`/`clearTimeout` calls.
**Action:** Always wrap frequent, high-fire-rate events (like `mousemove`, `scroll`) with a throttle or debounce mechanism (e.g., `setTimeout`) to ensure callbacks execute at a manageable rate (e.g., 150ms intervals).
