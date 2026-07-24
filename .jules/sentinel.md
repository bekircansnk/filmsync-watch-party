## 2026-07-24 - XSS in Modal Overlays
 **Vulnerability:** Unsafe interpolation of `roomName` directly into `innerHTML` strings in `showAutoJoinOverlay` and `showNamePromptModal`.
 **Learning:** Using `innerHTML` with unsanitized dynamic inputs derived from query parameters allows an attacker to perform Cross-Site Scripting (XSS) by crafting malicious links.
 **Prevention:** Use safe DOM assignment methods like `textContent` for dynamic content after setting a static structural template with `innerHTML`, or create elements fully dynamically using `document.createElement`.