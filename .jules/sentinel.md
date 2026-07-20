## 2024-07-20 - URL Parameter DOM-based XSS Vulnerability
**Vulnerability:** User-provided URL parameters (`join`) were directly injected into `innerHTML` using template literals during UI rendering (in `showAutoJoinOverlay` and `showNamePromptModal`).
**Learning:** Even though the input comes from the query string (which seems harmless), rendering it directly via `innerHTML` without sanitization enables DOM-based XSS.
**Prevention:** Avoid using template literals directly inside `innerHTML` with unsanitized inputs. Always assign user inputs using safe properties like `.textContent` or `innerText` on specific DOM elements after the template structure has been rendered.
