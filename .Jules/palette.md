## 2026-08-15 - Interactive Icon Accessibility
**Learning:** Emojis or icons used as interactive buttons (e.g., `#userAvatarDisplay`) must have proper keyboard accessibility attributes. Relying solely on `click` handlers prevents keyboard users from triggering them.
**Action:** Always add `role="button"`, `tabindex="0"`, `aria-label`, a visible focus style (`:focus-visible`), and handle `keydown` events (Enter and Space keys) for any interactive non-button element.
