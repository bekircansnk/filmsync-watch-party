## 2024-10-09 - XSS Vulnerability in UI Rendering
**Vulnerability:** Unsanitized user inputs (room names, user lists, platform names) were being directly interpolated into HTML strings and set via `.innerHTML`.
**Learning:** This codebase heavily uses template literals for generating dynamic UI elements and assigns them via `.innerHTML` without prior sanitization, leading to potential Cross-Site Scripting (XSS).
**Prevention:** Always use an `escapeHTML` function or use safe DOM methods like `.textContent` and `.createElement` instead of `.innerHTML` when interpolating variables containing user input.
