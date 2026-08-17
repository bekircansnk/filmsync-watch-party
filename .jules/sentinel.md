## 2024-08-17 - Path Traversal Prevention
**Vulnerability:** Dynamic path parameters (`roomId`, `userId`) in Firebase REST API calls are not validated before URL concatenation, risking Path Traversal.
**Learning:** Incoming messages from content scripts or untrusted sources can contain malicious paths like `../../` to access or overwrite unauthorized Firebase nodes.
**Prevention:** Always validate dynamic Firebase path parameters against an explicit regex mask (e.g., `/^[a-zA-Z0-9_-]+$/`) before constructing the REST URL.
