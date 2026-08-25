## 2026-08-25 - Debouncing global MutationObservers
**Learning:** Using a `MutationObserver` on `document.body` with `subtree: true` triggers extremely frequently on dynamic SPAs like Netflix. Running synchronous DOM queries (`querySelectorAll`) on every mutation blocks the main thread, dropping framerates and causing performance bottlenecks.
**Action:** Always debounce the callback of global `MutationObserver`s to prevent continuous DOM queries and maintain stable frontend performance.
