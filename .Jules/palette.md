## 2024-07-19 - Making Custom Buttons Accessible
**Learning:** Custom div-based buttons in content scripts need comprehensive a11y support (role, tabindex, aria-labels, and specific keyboard event handlers for Enter/Space) as they don't inherit native button behaviors. Providing clear `:focus-visible` styling is also crucial to avoid breaking extension flow for keyboard users.
**Action:** When adding or auditing floating action buttons or copy-to-clipboard elements, always ensure full ARIA attributes and keyboard event parity with native `<button>` elements.
