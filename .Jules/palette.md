## 2026-08-26 - Keyboard Accessibility for Custom Interactive Elements
**Learning:** Custom interactive elements (e.g., `<span>` used as buttons) must have proper keyboard accessibility attributes and event handlers to ensure a good UX for all users.
**Action:** Always add `role="button"`, `tabindex="0"`, an `aria-label`, and handle both `Enter` and `Space` key presses for interactive non-button elements.
