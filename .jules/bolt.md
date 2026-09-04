## 2026-09-04 - Debounce MutationObserver
**Learning:** Using MutationObserver on document.body with subtree: true without debouncing can cause severe main-thread blocking and performance bottlenecks, especially in dynamic SPAs like Netflix where the DOM updates frequently.
**Action:** Always wrap the callback of a global MutationObserver with a debouncer (e.g., setTimeout) to limit the frequency of function execution and prevent UI freezes.
