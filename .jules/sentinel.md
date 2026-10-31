## 2024-10-31 - [Security Audit]
**Vulnerability:** Firebase public data read and potentially write. The `database.rules.json` looks like it has appropriate restrictions to specific nodes, except there might be some issues with how `isPublic` or `password` fields could be manipulated. However, there are no hardcoded secrets other than the API Key which is intended.
**Learning:** Firebase keys in client-side code are not secrets, they only identify the project to Firebase services. Actual security comes from database rules.
**Prevention:** Keep database rules tight, verifying authentication context if required, and enforce schema validation through `newData.hasChildren()` and type checking (which this repository is already doing).
