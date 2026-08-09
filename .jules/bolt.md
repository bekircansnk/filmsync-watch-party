## 2026-08-09 - Main thread contention from unthrottled global events
**Learning:** Frequent continuous global events (like `mousemove` over full-screen video players) in this app can cause main thread contention and DOM recalculation storms, leading to stuttering during playback.
**Action:** Throttle the `mousemove` handlers using a timestamp-based check and append `{ passive: true }` when attaching such listeners to ensure they don't block scrolling or other default operations.
