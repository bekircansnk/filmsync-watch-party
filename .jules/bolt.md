## 2026-10-03 - Unthrottled DOM Event Jank
**Learning:** Attaching unthrottled `mousemove` and `keydown` event listeners to the `document` for idle detection causes excessive timer resets and DOM queries, leading to main-thread jank on heavy streaming sites.
**Action:** Always wrap high-fire-rate global events with a throttle mechanism (e.g., 150ms interval) to minimize overhead without sacrificing responsiveness.
