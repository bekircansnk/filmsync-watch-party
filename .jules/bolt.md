## 2026-08-19 - Debounce MutationObserver for SPAs
**Learning:** Utilizing a `MutationObserver` on `document.body` with `subtree: true` (e.g., for injecting UI elements on single-page applications like Netflix) without a debounce can cause severe main-thread blocking and performance bottlenecks due to executing synchronous DOM queries on every single mutation.
**Action:** When observing global mutations in highly dynamic SPAs, always debounce the observer callback (e.g., using `setTimeout` and `clearTimeout`) to ensure DOM queries are batched and executed only after mutations settle.
