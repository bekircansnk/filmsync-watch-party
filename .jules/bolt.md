## 2024-10-24 - Debounce Global MutationObservers in SPAs
**Learning:** Attaching a generic MutationObserver to `document.body` in highly dynamic SPAs like Netflix without debouncing or initialization checks can severely degrade main-thread performance by triggering callbacks continuously during DOM manipulations.
**Action:** Always wrap global DOM observer callbacks with a debounce function (e.g., 250ms) and use a boolean lock to ensure only one listener is initialized per session.
