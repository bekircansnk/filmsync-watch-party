
## 2026-08-27 - Accessible Custom Buttons
**Learning:** Custom interactive elements (like `<span>` used for avatars) lack native button behaviors, breaking keyboard navigation and screen reader support.
**Action:** Always add `role="button"`, `tabindex="0"`, `aria-label`, and a keyboard event listener (Enter/Space) to non-button elements with click handlers to ensure full accessibility.
