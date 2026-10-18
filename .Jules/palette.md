## 2024-05-24 - Missing ARIA Labels in Injected Content
**Learning:** Injected UI components (like chat buttons and close buttons) heavily rely on title attributes but lack aria-labels, making them less accessible to screen readers that don't announce titles by default. Icon-only buttons (like the chat toggle, send message, and close buttons) are the primary offenders.
**Action:** Always verify that injected HTML strings for UI components contain proper `aria-label` attributes, especially for icon-only buttons, even if a `title` or custom tooltip attribute is present.
