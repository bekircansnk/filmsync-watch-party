## 2026-08-29 - Debouncing Subtree Mutation Observers in SPAs
**Learning:** Using MutationObserver with subtree: true on document.body in highly dynamic Single Page Applications (like Netflix) triggers an overwhelming number of synchronous callbacks. This can cause severe main-thread blocking and performance bottlenecks if the callback performs DOM queries or modifications.
**Action:** Always wrap the callback of a document-wide MutationObserver in a debounce function (e.g., using setTimeout and clearTimeout) to batch execution and prevent layout thrashing and main-thread starvation.
