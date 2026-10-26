
## 2026-10-19 - Focus-within pseudo-class for nested inputs
**Learning:** Inputs nested in custom wrappers with outline suppression lose keyboard accessibility visually. We need to style the wrapper to show focus when the child is focused.
**Action:** Use `:focus-within` on custom input wrappers like `.user-input-wrapper` whenever native outline is disabled on the inner `<input>`.
