## 2026-05-18 - XSS in popup.js via innerHTML
**Vulnerability:** DOM XSS due to direct `innerHTML` usage with user-controlled data (`username`) from Firebase.
**Learning:** `innerHTML` interpolation (`card.innerHTML = \`...\${displayUsersText}...\``) shouldn't be used for dynamic content derived from a NoSQL database like Firebase.
**Prevention:** Use static HTML templates with `innerHTML` and populate dynamic data securely using `.textContent` and `.dataset` on specific query selectors.
