## 2024-05-18 - Improve Accessibility of Avatar Badge and Form Inputs
**Learning:** The popup UI relies heavily on icon-only interactive elements (like the avatar picker) and inputs without explicit labels. Screen readers struggle with elements that act like buttons but lack `role="button"` and `tabindex`.
**Action:** Always add `aria-label` to form inputs without visual labels. For custom interactive elements (like `<span>` acting as a button), add `role="button"`, `tabindex="0"`, an `aria-label`, and keyboard event listeners for 'Enter' and 'Space' to ensure full accessibility.
## 2026-09-05 - Improve Accessibility of Avatar Badge and Form Inputs
**Learning:** The popup UI relies heavily on icon-only interactive elements (like the avatar picker) and inputs without explicit labels. Screen readers struggle with elements that act like buttons but lack `role="button"` and `tabindex`.
**Action:** Always add `aria-label` to form inputs without visual labels. For custom interactive elements (like `<span>` acting as a button), add `role="button"`, `tabindex="0"`, an `aria-label`, and keyboard event listeners for 'Enter' and 'Space' to ensure full accessibility.
