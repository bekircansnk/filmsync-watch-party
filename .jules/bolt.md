## $(date +%Y-%m-%d) - Throttling High-Frequency Events

**Learning:** Attaching unthrottled `mousemove` and `keydown` event listeners to `document` (e.g., in `setupFullscreenIdleDetector`), or using un-debounced `MutationObserver` on `document.body` for highly dynamic SPAs (like Netflix) causes excessive DOM queries and timer resets. This leads to main-thread jank, especially on heavy streaming sites.
**Action:** Always wrap high-fire-rate global events with a throttle or debounce mechanism (e.g., using `setTimeout` at 150-200ms intervals) to prevent main-thread jank.
