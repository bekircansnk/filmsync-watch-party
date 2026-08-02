## 2024-05-15 - Initial Palette Journal\n**Learning:** Started keeping track of UX learnings.\n**Action:** Keep updating this file with more learnings.

## 2026-08-02 - Ensure Interactive Emojis are Accessible
**Learning:** Found an interactive emoji (avatar selector) functioning as a button without proper ARIA attributes, keyboard support, or focus styles. Even decorative or icon-only elements used for interaction must be fully accessible.
**Action:** When using non-standard interactive elements (like `<span>` with emojis), always add `role="button"`, `tabindex="0"`, `aria-label`, a `keydown` handler for 'Enter'/'Space', and clear `:focus-visible` styles.
