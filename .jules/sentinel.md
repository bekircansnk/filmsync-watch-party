## 2026-09-10 - Prevent Stored XSS in Extension Popup
**Vulnerability:** User-controlled data (usernames inside `displayUsersText`, `roomId`) from Firebase was directly interpolated into HTML via `innerHTML` in `extension/popup.js`, leading to potential Stored Cross-Site Scripting (XSS).
**Learning:** Even internal extensions reading from managed databases are vulnerable if data lacks sanitization before DOM insertion. The original code blindly injected variables directly into template strings.
**Prevention:** Always escape HTML entities (`&`, `<`, `>`, `"`, `'`) for variables used in `innerHTML`. Do not interpolate variables directly into HTML attributes; use safe DOM properties like `element.dataset` or `element.setAttribute()` after element creation.
