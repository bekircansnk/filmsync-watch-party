## 2026-10-19 - InnerHTML XSS Vulnerability in Toast Notifications
**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability was found in `extension/content.js` where user-controlled input (`targetTitle`) was directly interpolated into an HTML string assigned to `toastBody.innerHTML`.
**Learning:** Even internal extensions with UI components can be susceptible to XSS if external data like page titles or user inputs are injected directly into the DOM using `innerHTML` rather than text bindings.
**Prevention:** Always use safe DOM manipulation methods such as `textContent` or `innerText` to inject dynamic, external, or user-provided data into HTML elements. Avoid template literal interpolation within `innerHTML` for any dynamic content.
