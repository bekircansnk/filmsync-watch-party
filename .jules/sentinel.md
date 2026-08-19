## 2026-08-19 - Path Traversal Prevention
**Vulnerability:** Unvalidated dynamic inputs (`roomId` and `userId`) were concatenated directly into Firebase Realtime Database REST API `fetch` URLs, leading to potential path traversal and unauthorized database modification.
**Learning:** Using raw user-controlled data to build API endpoint paths exposes the extension to injection and path traversal attacks, even if client-side validation seems sufficient.
**Prevention:** All dynamic path parameters derived from untrusted inputs or Chrome messaging payloads must be strictly validated against an explicit regex mask (e.g., `/^[a-zA-Z0-9_-]+$/`) before URL concatenation.
