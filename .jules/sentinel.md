## 2024-09-07 - Fix Stored XSS in list rendering
**Vulnerability:** A list rendered user data fetched from a public database using innerHTML, allowing Stored XSS.
**Learning:** Data from a public real-time database must always be considered untrusted and sanitized before rendering.
**Prevention:** Always use safe DOM manipulation methods like document.createElement and textContent to construct elements from external data.
