## 2024-10-25 - Focus-Within Accessibility on Custom Inputs
**Learning:** When using custom styling that hides native input elements and their focus outlines (like the `.user-input-wrapper`), keyboard users lose all visual feedback of where their focus is.
**Action:** Always add a `:focus-within` pseudo-class to the parent wrapper of custom-styled inputs to ensure focus is visually apparent and maintains accessibility standards.
