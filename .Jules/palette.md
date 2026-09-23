
## 2026-09-23 - Keyboard Accessibility for Interactive Spans
**Learning:** Custom interactive elements (like icon-only spans serving as buttons, e.g., the avatar picker) are invisible to screen readers and keyboard users without explicit semantics (`role="button"`, `tabindex="0"`, `aria-label`) and keyboard event listeners (`keydown` for Enter/Space).
**Action:** Always ensure any non-standard interactive element injected via the extension UI receives full ARIA attributes and keyboard support to maintain accessibility.
