## 2026-09-30 - Throttle Global Event Listeners
**Learning:** Attaching unthrottled `mousemove` and `keydown` event listeners to the `document` (e.g., in `setupFullscreenIdleDetector`) causes excessive DOM queries and timer resets, leading to main-thread jank, especially on heavy streaming sites.
**Action:** Always wrap these high-fire-rate global events with a throttle or debounce mechanism (e.g., using `setTimeout` at 150ms intervals).
