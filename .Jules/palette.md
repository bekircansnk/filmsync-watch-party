## 2026-05-15 - Interactive Elements Require Keyboard Support
**Learning:** Icon-only elements and custom emoji buttons (like the user avatar picker) acting as inputs lack native keyboard focus and accessibility descriptions, leading to poor keyboard navigation.
**Action:** Applied `role="button"`, `tabindex="0"`, `aria-label`, explicit `:focus-visible` styles, and mapped 'Enter'/'Space' keydown events to custom interactive `span` elements.
