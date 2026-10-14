## 2024-10-24 - DOM XSS via Unescaped Interpolation
**Vulnerability:** User inputs (`roomName`, `roomId`, `platformName`, `displayUsersText`) were directly interpolated into `.innerHTML` strings in `content.js` and `popup.js`, leading to critical DOM-based Cross-Site Scripting (XSS).
**Learning:** Even internal state strings mapped from external APIs or unvalidated query parameters can contain malicious payloads. Relying on `.innerHTML` with template literals without sanitization bypasses standard security defenses.
**Prevention:** Always implement and enforce an `escapeHTML` utility function when injecting any dynamic string variables into the DOM via `.innerHTML`, ensuring all HTML control characters (`<`, `>`, `&`, `'`, `"`) are properly HTML-entity encoded.
