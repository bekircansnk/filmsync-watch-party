## 2025-07-25 - Fix Reflected XSS in Join URL
**Vulnerability:** The room name retrieved directly from the `?join=` URL parameter was being injected directly into the DOM using `innerHTML` within `showAutoJoinOverlay` and `showNamePromptModal`. This allowed a malicious user to craft a URL with XSS payloads which would be executed when a victim clicks the link.
**Learning:** `innerHTML` is inherently unsafe for any user-provided data, especially when directly parsing and inserting variables from URL parameters without explicit sanitization.
**Prevention:** Avoid `innerHTML` whenever possible when including variable data. Use `.textContent` or `.innerText` on dedicated elements, or utilize a library to sanitize the data before passing it to `innerHTML`.
