
## 2026-09-06 - Missing ARIA Labels on Form Inputs
**Learning:** The popup interface relies heavily on placeholder text and visual proximity for form inputs (username, room code, switches) but lacks programmatic association or `aria-label` attributes, making it inaccessible to screen reader users.
**Action:** Always ensure that form input elements without visually associated `<label>` tags use an appropriate `aria-label` attribute to provide accessible names for assistive technologies.
