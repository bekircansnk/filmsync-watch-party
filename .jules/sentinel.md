## 2024-05-24 - [XSS vulnerability via innerHTML]
**Vulnerability:** XSS vulnerability through usage of `.innerHTML` with user-supplied variables like `roomId` and `roomName`.
**Learning:** Never pass untrusted user-supplied values into `.innerHTML`. Even if it seems they won't be executed directly, this is a dangerous anti-pattern that can lead to Cross-Site Scripting (XSS).
**Prevention:** Use DOM manipulation functions (`document.createElement`, `element.textContent`, etc.) to safely inject user data instead of raw HTML string concatenation into `.innerHTML`.
