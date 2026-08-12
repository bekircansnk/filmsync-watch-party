## 2025-02-12 - Fix XSS Vulnerabilities in DOM Insertion
**Vulnerability:** Found multiple instances of Cross-Site Scripting (XSS) vulnerabilities where untrusted input like `roomName`, `roomId`, `platformName`, and `displayUsersText` were being directly injected into `innerHTML` strings.
**Learning:** Bypassing `textContent` or `innerText` and dynamically embedding strings into `innerHTML` allows arbitrary HTML execution if the inputs contain malicious `<script>` or other elements, posing a critical security risk.
**Prevention:** Always use safe DOM manipulation methods like `createElement` paired with `textContent` or use a sanitization library before setting `innerHTML`.
