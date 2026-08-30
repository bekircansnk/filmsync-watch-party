## 2026-08-30 - Accessible Avatar Toggle
**Learning:** Interactive `span` elements acting as buttons (like `userAvatarDisplay`) need `role="button"`, `tabindex="0"`, and a `keydown` listener for Enter/Space to be accessible to keyboard users.
**Action:** Always add keyboard event listeners and ARIA roles/tabindex to custom interactive elements.
