## 2026-09-02 - Prevent XSS in Public Room List
**Vulnerability:** Usernames fetched from Firebase are directly concatenated into HTML via `innerHTML` in `loadPublicRooms`, leading to XSS vulnerabilities.
**Learning:** `innerHTML` should never be used with unsanitized data from a remote database (like Firebase), even if the app feels "internal" or client-side only.
**Prevention:** Use `textContent` for text injection and `.setAttribute()` for dynamic HTML attributes instead of string interpolation within `innerHTML` template strings.
