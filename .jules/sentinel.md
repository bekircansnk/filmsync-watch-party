## 2024-05-24 - Prevent Path Traversal in Firebase REST API Calls
**Vulnerability:** The `roomId` parameter from untrusted Chrome messaging payloads was concatenated directly into a Firebase Realtime Database REST API URL in the background service worker, allowing potential Path Traversal / SSRF attacks.
**Learning:** Chrome extension messages can be sent by potentially malicious content scripts, and their payloads must be treated as untrusted input. Dynamically constructing URLs with untrusted input without validation is dangerous.
**Prevention:** Always validate dynamic path parameters derived from untrusted sources against a strict regex mask (e.g., `/^[a-zA-Z0-9_-]+$/`) before concatenating them into URLs.
