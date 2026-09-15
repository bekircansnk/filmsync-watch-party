## 2026-09-15 - [Fix XSS via innerHTML]
**Vulnerability:** User-controlled input (like room name, ID, platform name) was being injected directly into the DOM using string interpolation inside .innerHTML.
**Learning:** Using template literals inside .innerHTML with untrusted data creates a Cross-Site Scripting (XSS) vulnerability.
**Prevention:** Always use safe DOM APIs like .textContent and .dataset to insert dynamic, user-provided values into elements created or modified with .innerHTML.
