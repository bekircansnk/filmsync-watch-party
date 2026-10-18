## 2024-05-24 - Layout Thrashing in Sync Loop
**Learning:** Calling `getBoundingClientRect()` within `findBestVideoElement()` on every remote sync event (via `ensureVideoReady`) forces a synchronous layout recalculation (reflow), causing micro-stutters during video playback.
**Action:** Always reuse the cached, connected `videoElement` reference instead of querying the DOM and calculating bounds on every sync check.
