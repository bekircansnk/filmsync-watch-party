## 2026-07-25 - Prevent Reflected XSS during HTML Interpolation
**Vulnerability:** Reflected Cross-Site Scripting (XSS) due to unsanitized URL parameters (`roomName`) being interpolated directly into dynamic `.innerHTML` templates in `extension/content.js`.
**Learning:** Using `innerHTML` with unsanitized dynamic user-controlled strings enables attackers to inject malicious scripts.
**Prevention:** Implement an `escapeHTML` helper function and always sanitize dynamic content before injecting it into the DOM via `innerHTML`, or alternatively prefer using `createElement` and `textContent`.
