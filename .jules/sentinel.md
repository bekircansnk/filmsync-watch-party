## 2024-05-18 - DOM XSS in URL Parameters
**Vulnerability:** DOM XSS caused by injecting unvalidated URL parameters (`roomName`) directly into `innerHTML` in `showAutoJoinOverlay` and `showNamePromptModal`.
**Learning:** External data from URLs (e.g., query params) should never be trusted and injected directly into the DOM using methods that evaluate HTML (like `innerHTML`).
**Prevention:** Use safer alternatives like `createElement` and `textContent` to construct elements dynamically, or parse HTML strings using `DOMParser` and inject variables as `textContent`.
