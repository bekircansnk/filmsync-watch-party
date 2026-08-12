## 2026-10-24 - Accessibility improvements for form inputs and interactive emojis
**Learning:** Emojis functioning as interactive elements (like the profile avatar) lack semantic meaning and keyboard focus, and inputs lacking visual labels need ARIA labels for screen readers. Connecting descriptions to inputs using `<label for="...">` improves hit area and a11y.
**Action:** Always add `role="button"`, `tabindex="0"`, `aria-label`, focus styles, and `keydown` event listeners to interactive emojis. Always provide `aria-label` for inputs without visual labels and use proper `<label>` elements.
