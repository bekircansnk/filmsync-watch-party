## 2024-05-25 - [Debouncing Broad MutationObserver]
**Learning:** Utilizing a `MutationObserver` on broad UI elements (like `document.body` with `subtree: true`) to track dynamic host pages can cause synchronous DOM query bottlenecks and main-thread blocking if not properly throttled.
**Action:** Always debounce the callback for broad `MutationObserver` instances to prevent performance degradation on heavy pages like Netflix.
