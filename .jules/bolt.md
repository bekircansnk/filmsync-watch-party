## 2026-07-29 - Throttled global mousemove event
**Learning:** Unthrottled global mousemove event listeners can cause high CPU overhead in the main thread due to frequent triggering (hundreds of times per second).
**Action:** Use a timestamp-based throttling mechanism and add `{ passive: true }` to `addEventListener` to reduce main thread contention and prevent potential input/scroll jank.
