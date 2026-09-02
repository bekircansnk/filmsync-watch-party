## 2024-05-24 - Publicly Writable Database

**Vulnerability:** The project's Firebase Realtime Database is publicly writable via the REST API due to open server-side security rules.
**Learning:** This vulnerability is documented here and cannot be fixed solely via client-side configuration changes.
**Prevention:** Proper Firebase security rules must be configured on the server side to restrict write access.
## 2026-09-02 - Prevent XSS in Public Room List
**Vulnerability:** Room data fetched from Firebase was being interpolated directly into HTML strings via innerHTML, causing an XSS vulnerability.
**Learning:** Dynamically rendering user-provided data directly into HTML templates is unsafe.
**Prevention:** Use placeholder elements and .textContent for text, and .setAttribute() for dynamic attributes to prevent DOM-based XSS.
