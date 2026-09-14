## 2024-05-24 - [XSS] Safe DOM Injection
**Vulnerability:** User-controlled input (like roomName, platformName, displayUsersText) was directly injected into template literal strings and assigned to innerHTML.
**Learning:** This application directly interpolates external input into innerHTML, which is a significant XSS risk.
**Prevention:** Always use safe DOM manipulation methods like document.createElement() and textContent, or explicitly sanitize HTML before assignment, rather than using innerHTML directly.
