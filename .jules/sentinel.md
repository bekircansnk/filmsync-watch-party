## Sentinel Initialized
## 2024-05-24 - Publicly Exposed Firebase Realtime Database
**Vulnerability:** Firebase database rules are likely open to public writing given the use of client-side `fetch` and SDK without authentication and hardcoded keys.
**Learning:** Client-side Firebase configurations are public by design, but database rules must restrict writes to authenticated users. If writes are open, anyone can overwrite database contents.
**Prevention:** Implement strict Firebase Security Rules on the server side and enforce authentication. Do not rely solely on client-side logic to prevent unauthorized writes.
