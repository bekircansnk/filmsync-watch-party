## 2026-08-25 - Keyboard Accessibility for Custom Emoji Buttons
**Learning:** Custom interactive elements, like emoji icons used as buttons (e.g., `#userAvatarDisplay`), lack native keyboard accessibility and screen reader support unless explicitly provided with `role="button"`, `tabindex="0"`, an `aria-label`, and `keydown` event listeners for 'Enter' and 'Space' keys.
**Action:** Always ensure that custom span/div elements acting as buttons have these accessibility attributes and keyboard event handlers.
