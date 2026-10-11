## 2026-10-11 - Prevent XSS in HTML Template Literals
**Vulnerability:** Unescaped URL parameters (like `roomName`) and database values were interpolated directly into `innerHTML` via template literals, leading to Cross-Site Scripting (XSS).
**Learning:** Even within modern template literals, assigning unescaped values directly to `innerHTML` exposes the application to XSS attacks, as variables are not automatically sanitized.
**Prevention:** Always use a sanitization function like `escapeHTML()` before injecting any dynamic data into `innerHTML`, or use `textContent` when HTML parsing is not required.
