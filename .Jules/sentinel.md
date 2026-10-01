## 2026-10-01 - [CRITICAL] Fix DOM XSS in room display and modals
**Vulnerability:** User inputs (roomId, userNames, roomName) were passed unsanitized into template strings used for `innerHTML` DOM assignments, leading to DOM-based Cross-Site Scripting (XSS).
**Learning:** `innerHTML` inherently trusts the string input. Passing user-controlled variables dynamically into HTML strings allows attackers to execute arbitrary scripts in the application's context (e.g. `room<img src=x onerror=alert(1)>`).
**Prevention:** Always use `textContent` where possible, or sanitize/escape all user-controlled data using a helper like `escapeHTML` before rendering via `innerHTML`.
