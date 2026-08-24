## 2026-08-24 - Custom Emoji Buttons & Placeholder-only Inputs Accessibility
**Learning:** Custom UI components functioning as buttons (like interactive emojis) and inputs relying solely on placeholders are inaccessible to keyboard users and screen readers unless explicitly marked up.
**Action:** Always include `role="button"`, `tabindex="0"`, `aria-label`, `:focus-visible` styles, and keyboard event listeners for Enter/Space on custom interactive icons. Ensure inputs without visual labels have an `aria-label`.
