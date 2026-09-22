## 2025-02-23 - Fix DOM XSS via innerHTML in UI Rendering
**Vulnerability:** Untrusted user input (like roomName, platformName, user lists) was being interpolated directly into `.innerHTML` template literals during DOM element creation in both `content.js` and `popup.js`.
**Learning:** Even when the app relies heavily on template literals for UI rendering, dynamic user-controlled strings must not be placed directly inside the HTML string, as this causes Cross-Site Scripting (XSS).
**Prevention:** For UI elements built with `.innerHTML` and template literals, assign dynamic content *after* the HTML is set by selecting the created DOM nodes and using `.textContent` or `dataset`.
