## 2024-09-22 - [CRITICAL] DOM-Based XSS via innerHTML Injection
**Vulnerability:** Unsanitized user inputs (`roomName`, `displayUsersText`, etc.) were directly injected into `.innerHTML` in `extension/content.js` (Auto-join overlay, Name prompt modal) and `extension/popup.js` (Public room cards).
**Learning:** Even internal app state variables originating from URL parameters or Firebase data can carry malicious payloads. Using template literals with `.innerHTML` is inherently unsafe for dynamic text.
**Prevention:** Always use `.textContent` for dynamic text insertion, or implement a robust HTML escaping function (like `escapeHTML`) before interpolation into `.innerHTML`.
