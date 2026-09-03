## 2024-06-25 - Debounce MutationObserver in Netflix
**Learning:** The application uses a `MutationObserver` on `document.body` with `subtree: true` to inject UI elements (like the "Start Party" button) in dynamic SPAs like Netflix. The observer fires many times synchronously for DOM mutations, causing severe main-thread blocking and performance overhead.
**Action:** Always debounce the `MutationObserver` callback using `setTimeout` (and `clearTimeout`) to prevent main-thread blocking and optimize DOM operations.
