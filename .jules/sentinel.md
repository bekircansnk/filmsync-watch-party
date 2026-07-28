## 2026-07-28 - Path Traversal Prevention in background.js
 **Vulnerability:** Path Traversal via unvalidated `roomId` parameter in `page-unload` messages.
 **Learning:** Dynamic path parameters derived from untrusted Chrome messaging payloads must be strictly validated before being used in URL concatenation for REST API calls.
 **Prevention:** Implemented a regex mask (`/^[a-zA-Z0-9_-]+$/`) to validate the `roomId` before making Firebase fetch requests.
