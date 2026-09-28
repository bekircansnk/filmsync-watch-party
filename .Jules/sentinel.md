## 2026-07-20 - Fix DOM-based XSS in template literals
**Vulnerability:** User-controlled inputs like `roomName`, `roomId`, and `username` were directly interpolated into HTML strings via template literals and injected into the DOM using `.innerHTML`, allowing potential Cross-Site Scripting (XSS).
**Learning:** Explicitly casting variables to string before regex replacement prevents type juggling bypasses when arrays or unexpected objects are passed into an HTML escaping function.
**Prevention:** Always implement an explicit coercion step (`String(str)`) in HTML escaping helpers, and ensure all untrusted data is wrapped with this helper before `.innerHTML` injection.
