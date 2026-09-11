## 2024-10-24 - Debouncing MutationObserver for Host Pages
**Learning:** Attaching a MutationObserver with `subtree: true` on `document.body` in dynamic SPAs like Netflix triggers the callback hundreds of times per second. Running DOM queries (like `querySelectorAll`) inside this synchronous callback blocks the main thread and causes severe stuttering during video playback.
**Action:** Always debounce MutationObserver callbacks when tracking broad UI elements on dynamic host pages to ensure UI queries execute efficiently without degrading performance.
