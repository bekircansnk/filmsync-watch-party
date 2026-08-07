## 2026-08-07 - Prevent Path Traversal in Firebase REST API Paths

**Vulnerability:**
The `background.js` script fetches and updates the Firebase Realtime Database using the REST API. Dynamic variables derived from user-provided Chrome extension message payloads (such as `roomId` and `userId`) were concatenated directly into URL strings (e.g., `.../rooms/${roomId}/...`) without sufficient validation, leading to potential Path Traversal vulnerabilities where an attacker could provide something like `../other_node`.

**Learning:**
Unlike using the Firebase SDK which may implicitly handle or restrict invalid path characters, directly making HTTP fetch requests to `.json` endpoints requires strict manual path parameter validation before concatenating user inputs into URLs to prevent unauthorized reads, writes, and deletions.

**Prevention:**
Always validate that variables used as Firebase database keys conform to a strict alphanumeric and symbolic format (`/^[a-zA-Z0-9_-]+$/`) before being appended to the path of any REST API request.