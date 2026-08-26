## 2026-08-26 - Debouncing Global MutationObservers
**Learning:** Using `MutationObserver` on `document.body` with `subtree: true` in highly dynamic SPAs (like Netflix) without debouncing causes severe main-thread blocking and performance bottlenecks due to executing synchronous DOM queries on every single mutation.
**Action:** Always debounce global DOM mutation callbacks using `setTimeout` to batch UI updates and preserve frame rates.
