## 2026-09-29 - Security Audit: Firebase Configuration and Secrets
**Vulnerability:** The user requested an audit of Firebase API keys, hardcoded secrets, and database write rules in the extension configuration files.
**Learning:** Firebase API keys in client-side code are not a security vulnerability; they merely identify the project to Google servers. Security is enforced through Firebase Security Rules on the backend, not by hiding the API key. There are no other hardcoded administrative credentials found in the codebase.
**Prevention:** Educate developers that Firebase API keys are public and secure the database using robust Firebase Security Rules. Avoid storing service account keys or administrative credentials in client-side extensions.
