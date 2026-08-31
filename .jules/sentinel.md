## 2026-08-31 - DOM XSS in Public Room Rendering
**Vulnerability:** Usernames were being injected directly into the DOM using string interpolation within `innerHTML` during `loadPublicRooms`, leading to potential Cross-Site Scripting (XSS).
**Learning:** Even when the data originates from a Firebase database, client-side rendering must treat it as untrusted, especially since the database rules might be permissive.
**Prevention:** Use `.textContent` for dynamic text injection and `.setAttribute()` for assigning user-provided data to HTML attributes, avoiding string interpolation within `innerHTML` templates.
