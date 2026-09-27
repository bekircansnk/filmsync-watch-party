## 2024-05-18 - Prevent DOM-based XSS in popup room rendering
 **Vulnerability:** Unsafe `.innerHTML` usage in `extension/popup.js` allows DOM-based Cross-Site Scripting (XSS) via injected data (like room descriptions/names).
 **Learning:** Never interpolate untrusted user data or data directly originating from external sources (e.g. Firebase DB) into `.innerHTML`.
 **Prevention:** Use safe DOM assignment methods like `.textContent` to render variables safely.
