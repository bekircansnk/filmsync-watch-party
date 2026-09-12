## 2024-05-30 - [Reflected XSS in Template Strings]
**Vulnerability:** User-controlled values (`roomName` and `displayUsersText`) were directly interpolated into `innerHTML` template strings during modal/card generation.
**Learning:** Directly injecting unescaped user input into `innerHTML` exposes the extension to Cross-Site Scripting (XSS) attacks, even if it's within a seemingly harmless prompt or card.
**Prevention:** Instead of injecting variables directly into HTML templates, create an element with an ID (or class), use `innerHTML` for the static markup, and then safely assign user input using DOM APIs like `document.querySelector().textContent = userInput;`.
