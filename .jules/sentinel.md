
## 2026-09-06 - Fix XSS vulnerabilities in UI
**Vulnerability:** Unsanitized user inputs were being directly interpolated into DOM nodes using innerHTML in popup components and page overlays.
**Learning:** Bypassing standard DOM methods when creating complex UI elements allows malicious variables to inject executable code into the host page or extension popup.
**Prevention:** Avoid embedding variables directly within template literals assigned to innerHTML. Use placeholders with CSS classes and safely assign text via `textContent`, and build actionable elements via `document.createElement`.
