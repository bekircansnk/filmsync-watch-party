## 2024-05-15 - DOM-based XSS Vulnerability in UI Components
**Vulnerability:** User-controlled data (e.g. `roomId`, `platformName`, `displayUsersText`, `roomName`) was being injected directly into the DOM using `.innerHTML` without escaping, exposing the extension to DOM-based Cross-Site Scripting (XSS) attacks.
**Learning:** Always treat user-provided data, especially from external sources like URLs or databases, as untrusted. Using `.innerHTML` with such data allows arbitrary code execution.
**Prevention:** Use an `escapeHTML` helper function to sanitize data before injecting it via `.innerHTML`, or prefer using `.textContent` assignments when constructing DOM elements to prevent script execution.
