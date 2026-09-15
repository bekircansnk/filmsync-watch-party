## 2024-09-15 - [Popup A11y Fixes]
**Learning:** Interactive `<span>` elements used as buttons and inputs relying only on placeholders lack essential screen reader and keyboard support in this popup.
**Action:** Always add `role="button"`, `tabindex="0"`, `aria-label`, and `keydown` event listeners (Enter/Space) to custom non-button interactive elements, and `aria-label` to form inputs.
