## 2026-10-09 - Added keyboard accessibility to custom UI controls
**Learning:** In this extension, there's a pattern of using `<span>` and `<div>` elements (like `.user-avatar-badge` and `.platform-card`) as interactive buttons without corresponding ARIA roles or keyboard event handlers, which severely degrades keyboard accessibility.
**Action:** Always ensure that any non-button element acting as an interactive control receives `role="button"`, `tabindex="0"`, and `keydown` listeners for 'Enter' and ' ' (Space) keys to make the UI fully accessible.
