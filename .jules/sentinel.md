## 2026-08-30 - Prevent XSS in Room List
**Vulnerability:** XSS via unescaped username and roomId injection in DOM creation.
**Learning:** Constructing DOM via innerHTML string interpolation with dynamic data (like usernames) allows script injection.
**Prevention:** Use textContent for dynamic text injection and setAttribute for data attributes instead of template strings.
