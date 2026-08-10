## 2026-08-10 - Firebase REST API Path Traversal Prevention
**Vulnerability:** User inputs (`roomId`, `userId`) were concatenated directly into Firebase Realtime Database REST API URLs via `fetch()` requests in extension scripts (background/popup.js), enabling potential Path Traversal.
**Learning:** Using template literals to build Firebase REST endpoint paths with unvalidated extension inputs risks attackers manipulating requests (e.g. escaping `/rooms/${id}.json`) to affect unintended nodes.
**Prevention:** Always strictly validate dynamic path parameters from Chrome messaging payloads or local storage against an explicit regex mask (like `/^[a-zA-Z0-9_-]+$/`) before URL concatenation when querying Firebase via REST.
