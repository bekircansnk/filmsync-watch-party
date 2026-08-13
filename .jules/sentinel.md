## 2026-08-13 - [Fix Path Traversal in Firebase REST API]
**Vulnerability:** Dynamic variables (like `roomId`, `userId`) derived from Chrome messaging or UI interactions were being concatenated directly into Firebase Realtime Database REST API endpoints (e.g., `fetch(\`https://.../rooms/${roomId}.json\`)`), leading to potential Path Traversal vulnerabilities.
**Learning:** Always strictly validate dynamic path parameters against an explicit regex mask (e.g., `/^[a-zA-Z0-9_-]+$/`) before using them in URL construction to ensure requests only access intended database nodes.
**Prevention:** Added `isValidPathSegment` validation checks in `background.js` and `popup.js` to ensure variables conform to the expected format before executing any HTTP requests.
