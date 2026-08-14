## 2026-01-01 - Fix Reflected XSS in Auto-Join and Prompt Modals
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) via `innerHTML` injection of unvalidated `roomName` sourced from URL query parameters (`?join=...`).
**Learning:** Using `innerHTML` with template literals containing dynamic user input or URL parameters bypasses HTML sanitization, allowing arbitrary JavaScript execution.
**Prevention:** Avoid injecting dynamic variables directly into `innerHTML`. Use `textContent` or `innerText` to safely populate dynamic parts after setting the static HTML structure.
