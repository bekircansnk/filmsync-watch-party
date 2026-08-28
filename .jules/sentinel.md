## 2026-08-28 - DOM-based XSS in Popup Room List
**Vulnerability:** User-controlled data (displayUsersText, platformName) is interpolated directly into `innerHTML` strings.
**Learning:** Even internal UI components like popups are vulnerable if dynamic text isn't sanitized before HTML insertion.
**Prevention:** Use `textContent` for inserting text and `setAttribute` for dynamic attributes to prevent script execution.
