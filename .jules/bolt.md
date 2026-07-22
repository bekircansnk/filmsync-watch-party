## 2024-05-24 - Throttling Global Events Over Video Players
**Learning:** Unthrottled global events (like `mousemove` and `keydown`) over continuous playback environments (video players) cause significant main thread contention, creating frame drops.
**Action:** Always implement a timestamp-based throttle (e.g., 200ms) for global events tied to non-critical UI interactions (like idle detection) in high-load visual components.
