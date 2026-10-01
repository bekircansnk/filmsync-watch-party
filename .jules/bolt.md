## 2026-10-01 - Throttle high-frequency global event listeners
**Learning:** Attaching unthrottled `mousemove` and `keydown` event listeners to the `document` causes excessive timer resets and DOM interactions, leading to main-thread jank on heavy streaming sites.
**Action:** Always wrap high-fire-rate events with a throttle or debounce mechanism (e.g., using `setTimeout` at 150ms intervals) to minimize main-thread blocking and preserve playback performance.
