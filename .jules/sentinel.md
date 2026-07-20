# Sentinel Security Journal

## 2024-05-24 - Firebase API Key Audit
**Context**: Evaluated the extension's codebase (`manifest.json`, `content.js`, `popup.js`, `background.js`) for hardcoded secrets and database permissions.
**Findings**:
- Hardcoded Firebase config values (including `apiKey`) in `content.js` and `popup.js` are intentionally embedded because the extension lacks a build step or `.env` loader, which is common in plain JavaScript Chrome extensions.
- Client-side database integration relies heavily on these keys for standard Firebase RTDB operations.
- The `background.js` makes `fetch` requests with `PATCH` and `POST` directly to the REST RTDB endpoints.
- No administrative credentials (`serviceAccount`, `credential` objects, explicit admin bypasses, or database secrets) were found exposed in the codebase.
**Action**: Verified configuration safety according to architecture constraints. Added security audit logging in the main changelog.