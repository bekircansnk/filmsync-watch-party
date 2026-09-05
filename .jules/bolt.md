
## 2026-09-05 - Debounce Netflix UI MutationObserver
**Learning:** In dynamic SPAs like Netflix, attaching a `MutationObserver` to `document.body` with `subtree: true` without debouncing causes severe main-thread blocking and high CPU load due to the massive number of DOM mutations.
**Action:** Always debounce callbacks for `MutationObserver` that watch `document.body` subtree changes using `setTimeout` to prevent UI freezing and ensure a smooth user experience.
