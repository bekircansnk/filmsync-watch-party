## 2026-08-31 - Firebase Database Open Write Permissions Analysis
**Vulnerability:** Firebase Realtime Database has exposed write accesses, allowing unauthenticated users to modify data (e.g. creating rooms or modifying states) via the REST API.
**Learning:** Hardcoded Firebase API keys in client-side code are public by design, but the underlying database must be secured using robust Firebase Security Rules. Relying solely on client-side logic to protect data is insufficient as attackers can interact directly with the database API.
**Prevention:** Implement strict Firebase Security Rules (`database.rules.json`) on the server side to validate all write operations, ensuring only authenticated or authorized requests can modify sensitive nodes.
