## 2026-08-27 - Debounce MutationObservers for Single Page Applications
**Learning:** `MutationObserver` on `document.body` with `subtree: true` can cause severe main-thread blocking if synchronous DOM queries (like `querySelectorAll`) are executed on every single mutation, especially in highly dynamic SPAs like Netflix.
**Action:** Always debounce the `MutationObserver` callback when observing large subtrees and performing DOM queries to reduce the number of redundant operations.
