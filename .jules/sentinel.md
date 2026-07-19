## 2024-08-01 - DOM-based XSS via innerHTML
**Vulnerability:** Unsanitized user inputs (`msgUser`, `message`, `sender`, `text`, `username`) were being injected into the DOM using `innerHTML` in `extension/content.js` and `extension/popup.js`.
**Learning:** Constructing HTML strings with user input and setting `innerHTML` exposes the application to XSS attacks, allowing malicious scripts to be executed in the context of the extension.
**Prevention:** Always use safe DOM manipulation methods like `document.createElement()` and `textContent` or `innerText` to construct DOM elements, especially when dealing with user-provided data.
