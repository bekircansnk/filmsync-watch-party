
## 2026-10-05 - Prevent XSS in HTML Template Injections
**Vulnerability:** Found unescaped user inputs (like `roomName`, `displayUsersText`) being directly injected into the DOM via `.innerHTML` assignments using template literals in both `extension/popup.js` and `extension/content.js`.
**Learning:** In browser extensions, directly interpolating raw strings fetched from external sources (like Firebase database contents such as usernames or room names) into HTML templates creates a severe Cross-Site Scripting (XSS) risk. If a malicious user sets their name to an HTML/script tag, it will execute in the context of the extension or host page. Also, ensure the escaping function coerces all inputs to strings safely without early returns for non-strings.
**Prevention:** Always define and apply an `escapeHTML` sanitization function to any dynamic variable before passing it into `.innerHTML` constructs, or prefer using `.textContent` where HTML rendering is not required.
