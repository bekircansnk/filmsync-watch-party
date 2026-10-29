## 2026-10-18 - [Fix Cross-Site Scripting (XSS) Vulnerabilities]
**Vulnerability:** User-controlled input variables (`targetTitle`) were directly interpolated into DOM elements using `innerHTML` within `showMovieRedirectNotification` function in `extension/content.js`.
**Learning:** Even when inserting dynamic content into seemingly complex static UI components generated via template literals, placing raw user input directly inside strings meant for `innerHTML` evaluation introduces a critical XSS vector.
**Prevention:** Always use safe DOM APIs like `.textContent` to inject user-provided data, or explicitly escape HTML entities before placing dynamic text into an `innerHTML` string interpolation block.
