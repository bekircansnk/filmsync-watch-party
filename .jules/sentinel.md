## 2026-09-03 - Prevent XSS in DOM Injection
**Vulnerability:** XSS via unescaped string interpolation in innerHTML and attribute injection (data-code, data-room), plus open Firebase Realtime Database rules allowing public write.
**Learning:** Client-side rendering needs strict escaping and attribute handling via DOM APIs (setAttribute). Furthermore, Firebase rules must be secured server-side to prevent unauthorized database access.
**Prevention:** Use setAttribute for dynamic attributes instead of template strings. Use an escapeHTML helper for text content. Implement proper server-side authentication and rules for Firebase.
