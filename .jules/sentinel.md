## 2026-08-11 - Path Traversal Vulnerability in Firebase REST API Calls
**Vulnerability:** Unvalidated dynamic user inputs (`roomId`, `userId`) concatenated directly into Firebase REST API paths in `background.js` and `popup.js`.
**Learning:** `fetch` calls to Firebase use standard URLs where parameters can include directory traversal (`../`) or suffix alterations (`.json`), potentially allowing read/write access outside the intended path scope.
**Prevention:** All dynamic parameters used in Firebase paths must be validated strictly against a regex mask (e.g., `/^[a-zA-Z0-9_-]+$/`) before concatenation.
