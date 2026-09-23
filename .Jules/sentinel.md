## 2026-09-23 - DOM-based XSS in UI Modals
**Vulnerability:** Untrusted user input (like roomName) was directly assigned to DOM elements using template literals within innerHTML, creating a DOM-based XSS vulnerability.
**Learning:** Even internal app state variables that originate from URL parameters or database values (e.g. roomName from Firebase) must be treated as untrusted and properly sanitized or safely assigned.
**Prevention:** Avoid innerHTML for rendering variables. Instead, render static HTML structure with innerHTML, then query the target element and assign untrusted data using .textContent. For complex strings, use an escapeHTML helper function.
