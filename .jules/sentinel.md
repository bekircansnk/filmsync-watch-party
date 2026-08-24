## 2026-08-24 - Reflected XSS via URL Params in DOM Injection
**Vulnerability:** Untrusted input from URL parameters (`URLSearchParams`) was directly interpolated into `innerHTML` templates to construct UI overlays (e.g., room names in `showAutoJoinOverlay` and `showNamePromptModal`).
**Learning:** Even simple DOM string interpolation inside template literals can lead to arbitrary code execution if the interpolated variable contains unsanitized HTML/JS payloads.
**Prevention:** Never use `innerHTML` with dynamic variables. Inject static HTML via `innerHTML`, then populate dynamic parts securely using `.querySelector()` and `.textContent` or `.innerText`.
