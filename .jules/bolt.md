
## 2024-05-24 - Debouncing Netflix MutationObserver
**Learning:** Attaching an un-debounced `MutationObserver` with `subtree: true` on `document.body` in a dynamic React SPA like Netflix creates severe main-thread blocking, especially if `querySelectorAll` is used synchronously within the callback. Furthermore, observers initialized in a repeating `init()` function without state-tracking can easily duplicate themselves, exponentially degrading performance.
**Action:** Always debounce DOM read operations triggered by global `MutationObservers` and track initialization state to prevent overlapping listeners when functions run multiple times.
