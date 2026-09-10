## 2026-09-10 - Debounce Netflix MutationObserver
**Learning:** Utilizing a MutationObserver on `document.body` with `subtree: true` without debouncing causes synchronous DOM query bottlenecks and main-thread blocking on highly dynamic pages like Netflix.
**Action:** Always debounce the callback for broad MutationObservers to batch frequent DOM updates and prevent UI stuttering.
