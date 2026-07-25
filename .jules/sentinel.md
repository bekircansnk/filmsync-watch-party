## 2026-07-25 - Reflected XSS from URL Params
 **Vulnerability:** Reflected XSS via `roomName` URL parameter injected directly into DOM via `innerHTML` in `showAutoJoinOverlay` and `showNamePromptModal`.
 **Learning:** User input from URL parameters must always be sanitized before being injected into HTML to prevent malicious script execution.
 **Prevention:** Use a custom `escapeHTML` helper function to sanitize user inputs, or use safe DOM methods like `textContent` and `innerText` instead of `innerHTML`.
