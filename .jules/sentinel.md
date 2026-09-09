## 2024-05-24 - Stored XSS in UI Component Generation
**Vulnerability:** Unsanitized user data was injected into the DOM during the rendering of dynamic UI elements using template strings.
**Learning:** The vulnerability existed because data retrieved from a public real-time database was assumed safe, overlooking the fact that malicious actors could manipulate their entries to include executable HTML payloads.
**Prevention:** Never use template strings mapped to innerHTML when rendering dynamic content containing user-controlled variables. Always use secure DOM manipulation methods like document.createElement and textContent.
