## 2026-08-29 - Prevent XSS in dynamic HTML injection
**Vulnerability:** XSS vulnerability through unsafe string interpolation of user data into innerHTML and HTML attributes.
**Learning:** Using template strings to inject user input (like usernames) into innerHTML allows arbitrary script execution if the input contains malicious payloads. Dynamically setting attributes via innerHTML interpolation is also vulnerable.
**Prevention:** Use placeholder elements with CSS classes (not IDs to avoid duplicates) within the innerHTML template, then safely populate their text using `textContent` via `querySelector`. Set data attributes using `.setAttribute()` instead of interpolation.
