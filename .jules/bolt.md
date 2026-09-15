## 2024-09-15 - Debounce Global MutationObservers on SPAs
**Learning:** Attaching a synchronous `MutationObserver` to `document.body` on highly dynamic Single Page Applications (like Netflix) without debouncing causes severe main-thread blocking and frame drops, as it fires on every single DOM node change.
**Action:** Always debounce the observer callback and track initialization state (e.g., using a flag or checking for existing elements) when injecting UI elements via global body observers.
