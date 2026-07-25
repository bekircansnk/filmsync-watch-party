## 2024-07-25 - Throttle Global Events Over Video Players
**Learning:** Frequent continuous global events (like `mousemove` or `keydown`) over media elements can cause severe main thread contention and excessive DOM style recalculations, reducing video playback frame rates. This is especially true for interactions controlling UI visibility.
**Action:** Always throttle or debounce frequent global events (e.g., using a timestamp check of ~200ms) that trigger UI display updates.
