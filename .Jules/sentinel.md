## 2026-10-01 - Firebase Security Audit
**Vulnerability:** None. The Firebase configuration values in `popup.js`, `background.js`, and `content.js` are public identifiers, not administrative credentials.
**Learning:** Firebase API keys in web clients are architecturally intended to be public to allow the client SDK to identify the project. Local security rules are not present as they are managed via the Firebase Console.
**Prevention:** Continue to ensure that no administrative credentials (like Service Account JSON files) are committed to the repository.
