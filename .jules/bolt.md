## 2026-08-31 - Debounce MutationObserver
**Learning:** When using `MutationObserver` on `document.body` with `subtree: true` (e.g., for injecting UI elements in dynamic SPAs like Netflix), it can cause severe main-thread blocking and performance bottlenecks if not debounced.
**Action:** Always debounce the callback using `setTimeout` to prevent performance bottlenecks.
