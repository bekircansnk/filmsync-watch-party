## 2026-07-19 - [XSS Vulnerability Fix in Room Name]
**Vulnerability:** User-controlled `roomName` variable was directly injected into the DOM via `innerHTML` template strings in `extension/content.js`.
**Learning:** When sanitizing template strings to prevent Cross-Site Scripting (XSS), do not inject user-controlled variables directly into HTML strings assigned to `innerHTML`. Safely assign these values using `textContent`.
**Prevention:** Always use safe DOM APIs like `textContent` for dynamic values instead of string interpolation inside `innerHTML`.
