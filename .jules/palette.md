## 2024-10-28 - Focus Indicator for Custom Input Wrapper
**Learning:** When creating custom styled inputs that suppress the default browser outline (e.g., using outline: none and background: transparent !important inside .user-input-wrapper), keyboard accessibility and visual focus feedback are lost.
**Action:** Always add a :focus-within pseudo-class to the parent wrapper of such inputs to restore visible focus states, improving keyboard navigation and accessibility.
