## 2026-10-19 - Firebase API Key and Write Rules Analysis
**Vulnerability:** Checked for hardcoded secrets, API key leakages, and permissive Firebase rules.
**Learning:** Found that the Firebase `apiKey` is publicly exposed in configuration files, but this is a standard and expected practice for the Firebase Web SDK. Furthermore, `database.rules.json` uses open read/write (`.read: true`, `.write: true`) for `rooms/$roomId`, but correctly enforces data integrity and authorization via strict `.validate` rules.
**Prevention:** Continue to rely on `.validate` schemas to lock down data writes, and never place administrative service account keys inside client-side bundles.
