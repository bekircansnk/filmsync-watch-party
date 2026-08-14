## 2026-08-14 - Throttle global events over video players
**Learning:** Continuous global events (like `mousemove` and `keydown`) can cause significant DOM recalculation storms and main thread contention, particularly over active video players.
**Action:** Throttle frequent continuous event listeners (e.g. at 200ms) and use `{ passive: true }` when adding them to global objects like `document` so the browser knows `preventDefault()` won't be called, thus avoiding blocking main thread operations.
