## 2024-10-17 - XSS in showAutoJoinOverlay and showNamePromptModal
**Vulnerability:** The roomName parameter from the URL is injected directly into innerHTML in `showAutoJoinOverlay` and `showNamePromptModal` without escaping.
**Learning:** URL parameters mapped to UI text need careful sanitization to prevent DOM-based XSS when constructing DOM elements with innerHTML. It's safer to use querySelector and textContent to insert the dynamic value instead of string interpolation in template literals.
**Prevention:** Instead of injecting untrusted variables into `innerHTML`, set the structure with placeholders and then set their `textContent` to the untrusted variables.
