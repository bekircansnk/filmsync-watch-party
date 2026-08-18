## 2026-08-18 - Fix Reflected DOM XSS in UI Overlay
**Vulnerability:** DOM-based Reflected Cross-Site Scripting (XSS) via `roomName` URL parameters.
**Learning:** URL parameters parsed via `URLSearchParams` were passed unsanitized into ES6 template literals bound to `.innerHTML` in UI functions (`showAutoJoinOverlay`, `showNamePromptModal`).
**Prevention:** Avoid injecting dynamic, user-controllable input via `innerHTML`. Always use safe DOM API properties such as `.textContent` or `.innerText` when inserting dynamic text.
