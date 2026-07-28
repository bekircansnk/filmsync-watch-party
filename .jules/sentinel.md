## 2024-05-18 - Path Traversal in Firebase REST API

**Vulnerability:** The application was using untrusted `roomId` payloads from Chrome runtime messages to construct Firebase REST API paths (e.g., `fetch(".../rooms/${roomId}/...")`). This allowed path traversal if `roomId` contained `../`.

**Learning:** When transitioning from Firebase Client SDK (which may handle some escaping) to direct REST API calls, all dynamic URL segments must be strictly validated. Untrusted input from `chrome.runtime.onMessage` must never be directly concatenated into an API path.

**Prevention:** Always validate dynamic path parameters against an explicit regex mask (e.g., `/^[A-Z]{4}$/`) before URL concatenation when making Firebase REST API calls.
