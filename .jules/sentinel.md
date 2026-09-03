## 2026-09-03 - Firebase RTDB Public Write Vulnerability
**Vulnerability:** The Firebase Realtime Database is publicly writable via the REST API due to open server-side security rules.
**Learning:** Client-side configuration cannot fix server-side database rules. The API keys are public by design, but open database rules allow unauthorized modification.
**Prevention:** Implement strict server-side Firebase Security Rules to restrict read/write access based on authentication and data validation.
