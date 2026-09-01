## 2026-09-01 - Interactive Custom Elements Keyboard Accessibility
**Learning:** Interactive UI elements built with `<span>` or `<div>` (like the emoji avatar picker) often lack keyboard support (`tabindex="0"`, `role="button"`, and Enter/Space listeners), alienating keyboard and screen reader users despite having visual hover states.
**Action:** Always verify `role="button"`, `tabindex="0"`, `aria-label`, and `keydown` event listeners for 'Enter' and 'Space' when using non-native semantic elements for interaction.
