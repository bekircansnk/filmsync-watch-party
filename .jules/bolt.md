## 2024-09-24 - Debounce Netflix Start Button MutationObserver
**Learning:** Attaching an un-debounced MutationObserver on document.body for highly dynamic SPAs like Netflix causes severe main-thread blocking, as every minor DOM change fires the callback synchronously. Additionally, lacking an initialization flag can lead to multiple identical global observers being attached.
**Action:** Always debounce global MutationObserver callbacks (e.g., using setTimeout/clearTimeout) and track initialization state with a boolean flag before observing document.body.
