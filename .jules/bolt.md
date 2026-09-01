## 2026-09-01 - Debounce MutationObserver in Netflix Content Script
**Learning:** A MutationObserver observing `document.body` with `subtree: true` without debouncing can cause severe main-thread blocking and performance bottlenecks in dynamic SPAs like Netflix.
**Action:** Always debounce the MutationObserver callback using `setTimeout` (or `requestAnimationFrame`) to limit the frequency of UI injection checks.
