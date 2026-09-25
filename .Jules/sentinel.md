## 2026-09-25 - Fix DOM-based XSS in Auto-Join Overlays
**Vulnerability:** Untrusted input from URL parameters (`roomName`) was directly injected into the DOM via `.innerHTML` in `showAutoJoinOverlay` and `showNamePromptModal`.
**Learning:** Even internal extensions must treat data originating from URLs or cross-tab communication as strictly untrusted to prevent execution of malicious payloads (DOM XSS).
**Prevention:** Always use safe DOM APIs like `.textContent` to render dynamic user input, or sanitize HTML before insertion.
