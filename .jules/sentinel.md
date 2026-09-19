## 2024-05-18 - [Fix XSS via innerHTML]
**Vulnerability:** User-controlled inputs (`roomId`, `platformName`, `roomName` from URL params) were directly injected into DOM elements via `.innerHTML` in `extension/content.js` and `extension/popup.js`.
**Learning:** Using template literals directly within `.innerHTML` assignments exposes the extension to Cross-Site Scripting (XSS) attacks if the variables originate from untrusted sources (like Firebase RTDB or URL parameters).
**Prevention:** Always use safe DOM APIs like `.textContent` to inject user-controlled text into newly created or existing DOM elements instead of using `.innerHTML`.
