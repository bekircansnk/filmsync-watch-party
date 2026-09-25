## 2026-09-25 - Debounce DOM MutationObserver

**Learning:** Netflix is a highly dynamic SPA, causing constant DOM mutations. Attaching a MutationObserver directly to document.body with { childList: true, subtree: true } and firing expensive functions like querySelectorAll synchronously on every mutation causes severe main-thread blocking and frame drops.
**Action:** Always wrap MutationObserver callbacks in a debounce function (e.g., setTimeout with clearTimeout) when watching high-frequency DOM updates, especially on streaming platforms. Use a boolean flag to track initialization and prevent duplicate observer instances.
