## 2026-08-24 - Debouncing MutationObserver in Netflix SPA
**Learning:** Attaching a synchronous `MutationObserver` on `document.body` with `subtree: true` in highly dynamic Single Page Applications (like Netflix) causes severe main-thread blocking and performance bottlenecks, as it triggers on every single DOM mutation.
**Action:** Always wrap `MutationObserver` callbacks for dynamic SPAs with a debouncer (e.g., using `setTimeout`) to batch DOM queries and reduce main-thread load.
