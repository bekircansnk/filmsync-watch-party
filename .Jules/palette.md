## 2024-10-25 - Interactive Span Keyboard Accessibility
**Learning:** The `userAvatarDisplay` span acts as a primary user control to cycle avatars but completely lacked keyboard interaction mechanisms (`role`, `tabindex`, and `keydown`), stranding keyboard-navigating users.
**Action:** When converting non-interactive elements into pseudo-buttons, always bundle `role="button"`, `tabindex="0"`, and a `keydown` listener for Enter/Space to ensure functional keyboard parity.
