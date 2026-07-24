## 2024-05-18 - XSS via URL Parameter DOM Injection
**Vulnerability:** Reflected XSS allowed via unsanitized `roomName` parameter read directly from the URL (`?join=`) and embedded into the DOM using template literals via `innerHTML` inside modals.
**Learning:** Hardcoding unsanitized URL parameters directly into `innerHTML` is inherently unsafe because URL values can carry crafted scripts. The browser will run `<script>` tags or inline DOM handlers when rendering the HTML snippet.
**Prevention:** Always sanitize/encode user inputs (like escaping HTML characters `&`, `<`, `>`, `"`, `'`) using an escaping helper or use safe DOM methods like `textContent`/`innerText` instead of `innerHTML`.
