## 2026-08-21 - Interactive Emojis Keyboard Accessibility
**Learning:** Icon-only or emoji elements that act as buttons (like `userAvatarDisplay`) must have `role="button"`, `tabindex="0"`, explicit `aria-label` attributes, and `keydown` event listeners (for "Enter" and "Space") to be fully usable by keyboard and screen reader users.
**Action:** When adding or auditing clickable emojis or icons used as functional buttons, always ensure they are paired with a keydown handler and ARIA accessibility attributes, along with focus-visible states.
