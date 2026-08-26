## 2026-08-26 - Firebase Path Traversal Vulnerability
**Vulnerability:** Firebase Realtime Database REST API fetch requests used dynamic variables (`roomId`) without validating them, risking path traversal attacks if users inputted manipulated paths (e.g. `someRoom/.json`).
**Learning:** External inputs mapped to paths must always be securely validated against an expected format.
**Prevention:** Implement strict regex validation (like `/^[a-zA-Z0-9_-]+$/`) before dynamic inputs are concatenated into API endpoint URLs.
