## 2024-10-29 - Optimization: DOM Queries Cache (getCachedVideoElement)
**Learning:** Found repetitive and expensive full-document `querySelectorAll` queries traversing all Shadow DOMs via `findBestVideoElement()` taking place frequently on `setInterval` and event listeners.
**Action:** Replaced repetitive DOM queries by caching the `videoElement` and only recalculating if the element is not found, disconnected, or unready.
