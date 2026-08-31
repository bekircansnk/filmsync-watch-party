## 2026-08-31 - Keyboard Accessibility for Custom Interactive Elements
**Learning:** Custom interactive elements (like the avatar span acting as a button) require explicit ARIA attributes (`role="button"`), `tabindex="0"`, and `keydown` event listeners to ensure they are accessible via screen readers and keyboard navigation.
**Action:** Added `role="button"`, `tabindex="0"`, `aria-label`, and explicit keyboard listeners for 'Enter' and 'Space' keys to the user avatar display.
