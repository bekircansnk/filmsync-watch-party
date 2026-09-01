## 2024-05-24 - Initial setup
**Learning:** Initial setup
**Action:** Created file
## 2026-09-01 - Fix innerHTML interpolation
**Vulnerability:** The public room listing in popup.js directly interpolated user-controlled data into an innerHTML template string.
**Learning:** Using innerHTML with user-controlled input can lead to unsafe interpolation.
**Prevention:** Use the innerHTML + querySelector pattern with .textContent to safely inject dynamic text, and use .setAttribute() for dynamically assigning user data to HTML attributes.
