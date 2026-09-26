## 2026-07-20 - 🛡️ Sentinel: [High] Fix DOM-based XSS vulnerability in popup.js
 **Vulnerability:** Unsafe use of `innerHTML` in `popup.js` when rendering public rooms fetched directly from the Firebase Realtime Database. Values like `hostAvatar`, `hostName`, `platformName`, and `usersCount` are not sanitized and could lead to Cross-Site Scripting (XSS) if manipulated by a malicious user writing to the database.
 **Learning:** When rendering UI components from untrusted external data sources like Firebase (e.g. `usernames`, `roomIds`), avoid using `.innerHTML` directly.
 **Prevention:** Use safe DOM methods like `document.createElement()` and `textContent`, or explicitly sanitize values using an `escapeHTML` helper before insertion.

## 2026-07-20 - 🛡️ Sentinel: [High] Fix DOM-based XSS vulnerability in content.js
 **Vulnerability:** Unsafe use of `innerHTML` in `content.js` when rendering the loading overlay and name prompt modals, utilizing the untrusted `roomName` value derived from user-controllable URLs or Firebase state.
 **Learning:** When rendering UI overlays injected into content scripts, values derived from URL parameters or Firebase MUST be treated as strictly untrusted and sanitized.
 **Prevention:** Replaced `innerHTML` template literals with safe DOM element creation (`document.createElement`) and safe text assignment (`textContent`).
