## 2026-08-30 - Debouncing MutationObserver Callbacks
**Learning:** Executing synchronous DOM queries on every single mutation in highly dynamic Single Page Applications (like Netflix) causes severe main-thread blocking and performance bottlenecks.
**Action:** Always debounce MutationObserver callbacks using `setTimeout` when observing `document.body` with `subtree: true` to prevent excessive main thread execution.
