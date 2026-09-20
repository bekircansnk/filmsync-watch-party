## 2024-05-18 - Missing ARIA Labels on Extension Floating Buttons
**Learning:** The mini-toolbar floating buttons (like the main toggle and close buttons) in the extension UI lack `aria-label`s, making them difficult to use for screen reader users on streaming platforms.
**Action:** Add explicit `aria-label` attributes to dynamically injected icon-only buttons in `content.js` to ensure they are accessible.
