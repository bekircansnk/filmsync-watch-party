## 2026-08-23 - [CRITICAL] Prevent Path Traversal in Firebase REST API Paths
**Vulnerability:** Constructing REST API endpoint paths directly from untrusted payload parameters (`roomId`, `userId`) without sanitization allows an attacker to inject characters like `../` to access or modify data outside the intended Firebase path.
**Learning:** In extension context, Firebase SDK prevents this natively, but raw `fetch` calls dynamically constructing paths are vulnerable to REST API path traversal.
**Prevention:** All dynamic parameters used in Firebase URL concatenation must be strictly validated against a regex (e.g. `/^[a-zA-Z0-9_-]+$/`).
