## 2024-09-14 - Keyboard Accessibility and Form Labels
**Learning:** Found custom span-based buttons (avatar selection) lacking `role="button"`, `tabindex="0"`, and keyboard handlers. Input fields also lacked `aria-label` where explicit `<label>` elements were omitted for UI styling.
**Action:** Ensure all interactive custom UI elements have keyboard listeners (`keydown` for Enter/Space), appropriate ARIA roles, and `tabindex`. Inputs without visual labels MUST have `aria-label`.
