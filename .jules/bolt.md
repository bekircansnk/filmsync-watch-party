## 2026-09-02 - MutationObserver Debouncing
**Learning:** Using MutationObserver on document.body with `subtree: true` without debouncing causes severe main-thread blocking and performance bottlenecks, especially on dynamic SPAs like Netflix.
**Action:** Always wrap MutationObserver callbacks in a debounce function (e.g., `setTimeout`) when observing frequent DOM changes.
