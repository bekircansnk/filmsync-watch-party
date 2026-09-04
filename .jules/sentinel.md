## 2024-09-04 - Client-side XSS mitigation for public Firebase DB
**Vulnerability:** Firebase Realtime Database is publicly writable due to open rules, and the client directly injects data from Firebase into the DOM via innerHTML, leading to Stored XSS.
**Learning:** Even though we cannot secure the database rules directly from the client code, we must secure the client application from consuming potentially malicious payloads stored in the database.
**Prevention:** Avoid using `innerHTML` with unsanitized data (like usernames, room IDs, or URLs) fetched from the public database. Use safer DOM manipulation techniques like `document.createElement` and `.textContent`.
