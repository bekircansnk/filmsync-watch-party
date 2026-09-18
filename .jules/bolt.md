## 2024-05-15 - [Netflix MutationObserver Optimization]
**Learning:** Netflix's UI triggers frequent DOM mutations. Unbounded MutationObservers on `document.body` firing on every change to inject UI elements (like a start button) causes significant main thread thrashing and high CPU usage, degrading performance.
**Action:** Always debounce MutationObserver callbacks targeting `document.body` for DOM insertions in SPA environments, and ideally ensure the observer only attaches once, checking an initialization flag.
