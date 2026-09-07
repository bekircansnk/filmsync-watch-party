## 2024-09-07 - Add debouncing to MutationObserver for Netflix Button
**Learning:** `MutationObserver` without debouncing on a heavy `document.body` tree traversal can significantly bottleneck frontend performance, especially in host platforms like Netflix. Synchronous querying triggered on every small mutation can crash main-thread performance.
**Action:** When utilizing `MutationObserver` on broad UI elements, always debounce the callback (e.g. `clearTimeout(timer); timer = setTimeout(...)`) to avoid synchronous DOM query bottlenecks.
