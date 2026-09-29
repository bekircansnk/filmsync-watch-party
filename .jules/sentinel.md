## 2026-09-29 - DOM XSS in UI Overlays and Popup
**Vulnerability:** Found multiple DOM-based Cross-Site Scripting (XSS) vulnerabilities where untrusted data (like `roomName` from URL parameters and `username` from Firebase) was directly injected into the DOM via `.innerHTML` without sanitization.
**Learning:** UI injections using template literals with `.innerHTML` need strict sanitization. Using a helper function like `escapeHTML` with explicit string coercion prevents XSS and type-juggling bypasses.
**Prevention:** Always sanitize dynamic data from URL parameters or databases before using `.innerHTML`, or use `.textContent` instead.
