## 2026-08-25 - Path Traversal in Firebase REST URL
**Vulnerability:** extension/background.js script constructs Firebase REST URL endpoints directly concatenating untrusted inputs from Chrome messaging like `roomId` and `userId` without validation, leading to path traversal injection.
**Learning:** Chrome extension inputs should always be considered untrusted input before using them in fetch calls for REST API endpoints as they can manipulate the target path.
**Prevention:** Always validate identifiers from messaging APIs against a strict regex whitelist (e.g., `/^[a-zA-Z0-9_-]+$/`) before interpolating them into a URL path.
