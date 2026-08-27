## 2026-08-27 - Prevent XSS in loadPublicRooms
**Vulnerability:** DOM-based XSS in the popup interface caused by injecting user-controlled data (`displayUsersText`, `roomId`) directly into `innerHTML` using template literals.
**Learning:** Using template literals with `innerHTML` within loops (like rendering a list of rooms) allows attackers to execute arbitrary scripts if the data (such as usernames from Firebase) contains malicious HTML/JavaScript payloads.
**Prevention:** Instead of interpolating user data into `innerHTML`, use static placeholders (e.g., elements with specific CSS classes) in the HTML string and then safely inject the dynamic user-provided data using `textContent` and `setAttribute` on the corresponding DOM nodes.
