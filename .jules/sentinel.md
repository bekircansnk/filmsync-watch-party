## 2026-05-13 - Path Traversal in Firebase REST API calls
 **Vulnerability:** Dynamic path parameters like `roomId` and `userId` derived from untrusted Chrome messaging payloads were directly concatenated into Firebase REST API URLs in the background service worker, allowing for potential Path Traversal attacks.
 **Learning:** When making direct REST API calls using `fetch` or `XMLHttpRequest` with dynamic path segments, any unsanitized user inputs could lead to arbitrary endpoint accesses if not explicitly validated.
 **Prevention:** All dynamic parameters used in REST URL building (such as `roomId` and `userId`) must be strictly validated against an explicit regex mask (e.g., `/^[a-zA-Z0-9_-]+$/`) before URL concatenation to block any unauthorized directory traversals.
