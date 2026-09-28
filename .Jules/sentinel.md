
## 2026-09-28 - DOM-based XSS in Extension UI Rendering
**Vulnerability:** Untrusted data from Firebase (usernames) and URL parameters (room names) were directly interpolated into `.innerHTML` assignments without escaping.
**Learning:** Even internal UI components in browser extensions are vulnerable to DOM XSS if they dynamically construct HTML strings using unescaped inputs. Implicit coercion of arrays during string interpolation can bypass simple type checks.
**Prevention:** Always explicitly coerce inputs to strings (e.g., `String(str)`) and pass them through a robust `escapeHTML` helper before inserting them into `.innerHTML`.
