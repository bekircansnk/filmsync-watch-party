## 2026-07-20 - Open Firebase Realtime Database
**Vulnerability:** The Firebase Realtime Database is publicly writable via the REST API due to open server-side security rules.
**Learning:** Client-side obfuscation of API keys is insufficient if the backend database rules are set to `".read": true, ".write": true`. Anyone with the database URL can modify or delete data.
**Prevention:** Update the Firebase Database Rules on the server to require authentication or restrict access to authorized clients.
