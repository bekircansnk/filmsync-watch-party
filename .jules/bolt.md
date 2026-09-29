## 2026-09-29 - Throttle High-Frequency Events
**Learning:** Attaching unthrottled `mousemove` and `keydown` event listeners to the `document` (e.g., in `setupFullscreenIdleDetector`) causes excessive DOM queries and timer resets, leading to main-thread jank on heavy streaming sites.
**Action:** Always wrap these high-fire-rate events with a throttle or debounce mechanism (e.g., using `setTimeout` at 150ms intervals or tracking timestamps) to minimize performance overhead.
