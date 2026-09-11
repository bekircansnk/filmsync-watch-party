## 2024-09-11 - [Stored XSS in Public Room Cards]
**Vulnerability:** Usernames fetched from Firebase are directly injected into `innerHTML` when rendering public room cards in `extension/popup.js`.
**Learning:** Using `innerHTML` with unsanitized user-provided data directly creates an XSS vulnerability, even in seemingly safe UI contexts like a popup menu.
**Prevention:** Always sanitize user-provided data using a custom `escapeHTML` function when rendering dynamically constructed HTML strings using `innerHTML`, or prefer using safer methods like `document.createElement` and `textContent`.
