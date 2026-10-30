## 2026-10-30 - Focus Visibility on Custom Wrappers
**Learning:** Custom input wrappers that suppress default input focus outlines (like `.user-input-wrapper`) completely remove visual feedback for keyboard users, which is a critical accessibility issue specific to this app's styling approach.
**Action:** Always apply the `:focus-within` pseudo-class to the parent wrapper when `outline: none` is used on the inner input to restore keyboard focus visibility.
