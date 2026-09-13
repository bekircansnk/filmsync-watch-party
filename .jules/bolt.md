## 2024-09-13 - Debounce Global MutationObservers on SPAs
**Learning:** Attaching global MutationObservers to `document.body` without debouncing or initialization tracking on highly dynamic SPAs (like Netflix) can cause severe main-thread blocking due to duplicate listeners and high-frequency firing.
**Action:** Always track initialization state with a flag and debounce the observer callback to minimize DOM queries and maintain high frame rates.
