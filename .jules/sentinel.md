## 2025-02-27 - DOM XSS in `innerHTML` Injection
**Vulnerability:** Untrusted user inputs (`roomId`, `platformName`, `displayUsersText`, `roomName`) were directly injected into `innerHTML` property assignments in `extension/popup.js` and `extension/content.js`.
**Learning:** `innerHTML` executes HTML tags passed to it, causing DOM Cross-Site Scripting (XSS). Direct interpolation via template strings without escaping can be exploited if an attacker supplies a malicious payload in inputs like `roomName` or their username (which is embedded in `displayUsersText`).
**Prevention:** Always apply an HTML escape function (`escapeHTML(String(var))`) to dynamic variables before interpolating them into HTML structures assigned to `innerHTML`.
