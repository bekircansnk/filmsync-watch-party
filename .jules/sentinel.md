## 2026-06-25 - Fix XSS in roomName
**Vulnerability:** Cross-Site Scripting (XSS) vulnerability via `innerHTML` concatenation of the potentially untrusted `roomName` variable in `showAutoJoinOverlay` and `showNamePromptModal`.
**Learning:** Hardcoding unsanitized input via `innerHTML` inside extension's dynamic modals allows arbitrary scripts to execute.
**Prevention:** Always use safe DOM manipulation methods like `.textContent` and `.querySelector` to inject variable input, preventing malicious input execution.
