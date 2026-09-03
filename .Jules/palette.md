## 2026-09-03 - Keyboard Accessibility for Custom Interactive Elements
**Learning:** Custom interactive elements (like span badges for avatars) lack native keyboard accessibility and screen reader context, frustrating keyboard-only users who cannot activate or tab to them.
**Action:** Always apply `role="button"`, `tabindex="0"`, `aria-label`, and a keyboard event listener (Enter/Space) to non-button interactive elements, plus `focus-visible` styles to ensure full accessibility.
