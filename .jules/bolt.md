## 2024-10-24 - Debouncing DOM MutationObserver in SPA

**Learning:** Netflix uses a highly dynamic SPA architecture where DOM nodes are continually added/removed. Adding a `MutationObserver` on `document.body` without debouncing causes the callback (e.g., UI injection checks) to fire hundreds of times per second, blocking the main thread and creating significant lag. Additionally, running setup logic directly within the callback without checking initialization state can create duplicate observers or loops.
**Action:** Always debounce the callbacks of `MutationObserver`s attached to `document.body` in SPAs, and track initialization state to ensure listeners are only attached once.
