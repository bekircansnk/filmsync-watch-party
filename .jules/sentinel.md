## 2026-08-22 - Prevent Path Traversal in Firebase REST API Calls
**Vulnerability:** Path Traversal vulnerability when calling Firebase REST API endpoints using dynamically injected path variables (`roomId`, `userId`) originating from Chrome messaging payloads that lacked strict validation.
**Learning:** Directly concatenating untrusted inputs into Firebase URL paths (`/rooms/${roomId}/...`) could allow an attacker to bypass authorization rules or access unintended paths if the inputs contain directory traversal characters like `../` or `.json`.
**Prevention:** Strictly validate any dynamically used user inputs forming path variables in REST API calls using explicit regex masking (e.g. `/^[a-zA-Z0-9_-]+$/`) before URL concatenation.
