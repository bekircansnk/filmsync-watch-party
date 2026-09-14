
## 2024-05-30 - Debounce Global MutationObservers
**Learning:** Attaching a global `MutationObserver` on `document.body` for highly dynamic SPAs (e.g., Netflix) without debouncing causes severe main-thread blocking when reacting to every single DOM mutation. Repeated executions of query selectors severely degrade performance.
**Action:** Always debounce the callback (e.g., 300ms) and track the initialization state to prevent redundant observer attachments and main-thread freezing.
