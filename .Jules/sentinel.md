
## 2026-09-24 - DOM-based XSS in Extension UI
**Vulnerability:** Untrusted user inputs (room names, usernames, platform names) retrieved from the database were directly injected into the DOM using `.innerHTML` in both content and popup scripts, creating potential DOM-based Cross-Site Scripting (XSS) vectors.
**Learning:** Even when pulling data from a seemingly controlled backend like Firebase Realtime Database, user-generated content must always be treated as untrusted and sanitized before rendering via `.innerHTML`.
**Prevention:** Always use safe rendering methods like `.textContent` or sanitize inputs with an `escapeHTML` helper function before interpolating them into HTML strings for `.innerHTML`.
