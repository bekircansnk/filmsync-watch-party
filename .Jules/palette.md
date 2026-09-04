## 2026-09-04 - Keyboard Accessibility for Custom Interactive Elements
**Learning:** Using a `<span>` or `<div>` as a clickable button without ARIA roles and keyboard event listeners prevents screen reader and keyboard-only users from discovering and interacting with it.
**Action:** Always add `role="button"`, `tabindex="0"`, an `aria-label`, and a `keydown` event listener for 'Enter' and 'Space' when creating custom interactive elements that act as buttons.
