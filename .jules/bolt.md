## 2026-09-16 - Debouncing Global MutationObservers
**Learning:** Attaching global MutationObservers on document.body for highly dynamic SPAs (e.g., Netflix) without debouncing the callback can block the main thread and degrade performance due to excessive callback executions. It can also lead to duplicate listeners if not tracked.
**Action:** Always debounce the callback logic and track the initialization state when attaching MutationObservers on root elements to prevent performance bottlenecks.
