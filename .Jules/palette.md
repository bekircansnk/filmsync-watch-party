## 2026-05-15 - Missing ARIA Labels on Buttons
**Learning:** Icon-only buttons and emojis acting as interactive elements need ARIA labels and keyboard support for accessibility.
**Action:** Add `aria-label`, `role="button"`, and `tabindex="0"` to interactive emojis, and implement keyboard event listeners (Enter/Space).
