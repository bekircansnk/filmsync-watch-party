
## 2026-09-06 - Unthrottled MutationObserver on React SPA
**Learning:** Attaching a `MutationObserver` to `document.body` with `subtree: true` in a heavy React application like Netflix triggers thousands of times per second during rendering. Running `querySelectorAll` synchronously in this callback causes severe main-thread blocking.
**Action:** Always debounce or throttle `MutationObserver` callbacks when observing large subtrees, or scope the observation to a smaller, more specific DOM node.
