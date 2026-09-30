## 2026-09-30 - Prevent DOM XSS in template literals
**Vulnerability:** Untrusted user data (like room names and usernames) was injected directly into the DOM using `.innerHTML` combined with template literals in `extension/content.js` and `extension/popup.js`.
**Learning:** Bypassing standard DOM elements by injecting HTML strings is a common XSS vector. While some parts of the code used `.textContent`, modal construction and list rendering used raw template literals without HTML escaping.
**Prevention:** Always use `.textContent` for user input when possible. If HTML structure requires template literals, all user-controlled variables must be explicitly sanitized with a robust HTML escaping function that coerces inputs to strings before replacement.
