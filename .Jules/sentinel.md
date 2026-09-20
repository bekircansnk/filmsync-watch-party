## 2025-02-27 - [Fix XSS Vulnerabilities in UI Injections]
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) via `innerHTML` injection of unescaped variables like `${roomName}` and `${roomId}` in `extension/content.js` and `extension/popup.js`.
**Learning:** Hardcoding unsanitized variables directly into `innerHTML` strings makes the extension vulnerable to malicious user inputs (like a crafted `roomName` or `roomId` containing `<script>...`). Even within extensions, it allows script execution in the content script context.
**Prevention:** Always use safe DOM APIs like `document.createElement`, `.textContent`, or safe variable assignment on created elements rather than embedding arbitrary variables in template literals passed to `innerHTML`.
