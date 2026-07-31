## 2026-03-05 - Fix Reflected XSS in `innerHTML` injection
**Vulnerability:** Dynamic variables extracted from the URL (`joinRoom`) and Firebase database were injected directly into the DOM using `innerHTML` without sanitization. This allowed Reflected and Stored Cross-Site Scripting (XSS).
**Learning:** Even simple variable interpolations within template literals passed to `innerHTML` are vulnerable if the source is untrusted (e.g. URL query params, DB fields).
**Prevention:** Always use a utility function like `escapeHTML` to encode HTML entities when interpolating variables into `innerHTML`, or prefer using safer APIs like `textContent` and `innerText` for dynamic strings.
