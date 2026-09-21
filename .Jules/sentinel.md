## 2026-09-21 - DOM and Stored XSS via innerHTML
**Vulnerability:** User-controlled data (URL parameters and Firebase database entries) was passed directly into `innerHTML` strings for rendering modals and lists, leading to potential DOM XSS and Stored XSS.
**Learning:** Even internal UIs like modals or popup extensions are vulnerable if they reflect unescaped data from URLs (e.g. `roomName`) or real-time databases.
**Prevention:** Always use safe DOM APIs like `.textContent` to insert dynamic text, or implement robust HTML escaping before interpolation into `innerHTML`.
