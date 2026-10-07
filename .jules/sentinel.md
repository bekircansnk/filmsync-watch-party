## 2025-01-20 - XSS in innerHTML Variables
**Vulnerability:** User inputs like `username` or `roomName` are directly interpolated into `innerHTML` strings without sanitization. An attacker can set their username or room name to `<script>...</script>` or `<img src=x onerror=...>` and execute arbitrary code in the context of other users viewing the room list or joining rooms.
**Learning:** `innerHTML` shouldn't be used with unsanitized dynamic variables.
**Prevention:** Use an `escapeHTML` function to sanitize any variables injected into `innerHTML`, or prefer `textContent` for text insertion. Ensure inputs are coerced to strings before escaping to prevent array bypass.
