## 2026-08-26 - Fix XSS in `innerHTML` Render Loops
**Vulnerability:** Cross-Site Scripting (XSS) via `innerHTML` injection of unsanitized usernames and room IDs in `extension/popup.js`.
**Learning:** Rendering loops (`loadPublicRooms`) directly interpolated untrusted data (`userNames`, `roomId`) into `innerHTML` strings and DOM attributes (`data-code`), allowing arbitrary script execution or layout breaking.
**Prevention:** Use placeholder elements with CSS classes in `innerHTML` templates, and subsequently assign dynamic text via `textContent` and attributes via `setAttribute()` to ensure proper escaping.
