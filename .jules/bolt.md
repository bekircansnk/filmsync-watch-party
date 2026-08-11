## 2026-08-11 - Throttle frequent event listeners
**Learning:** Frequent events like `mousemove` can cause layout thrashing and performance degradation when left unthrottled.
**Action:** Always wrap `mousemove` callbacks in a throttle function, such as `requestAnimationFrame` or a timeout, to prevent blocking the main thread during video playback.
