## 2026-10-12 - Fix XSS Vulnerability in DOM Insertions
**Vulnerability:** XSS vulnerability through unsanitized user inputs (e.g., roomName, platformName) being interpolated directly into HTML template literals assigned to `innerHTML`.
**Learning:** Even internal app state data stored in Firebase can act as an XSS vector if not escaped before rendering.
**Prevention:** Always use a dedicated escaping function (`escapeHTML`) to sanitize untrusted strings before injecting them into the DOM via `innerHTML`.
