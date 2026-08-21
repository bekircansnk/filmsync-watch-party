## 2026-08-21 - Debouncing Global MutationObservers
**Learning:** Using `MutationObserver` on `document.body` with `subtree: true` without debouncing causes severe main-thread blocking and performance bottlenecks in highly dynamic Single Page Applications (SPAs) due to synchronous DOM query execution on every mutation.
**Action:** Always debounce the `MutationObserver` callback using `setTimeout` (e.g., 300ms) when observing the entire body or large subtrees in SPAs.
