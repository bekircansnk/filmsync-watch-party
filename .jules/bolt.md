## 2026-08-28 - Debouncing MutationObserver in SPAs
**Learning:** Using `MutationObserver` on `document.body` with `subtree: true` without debouncing causes severe main-thread blocking in highly dynamic Single Page Applications like Netflix, as it triggers synchronous DOM queries (`querySelectorAll`) on every single mutation.
**Action:** Always debounce the callback of global `MutationObserver` instances using `setTimeout` to batch UI updates and prevent performance bottlenecks.
