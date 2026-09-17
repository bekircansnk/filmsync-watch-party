## 2024-09-17 - Missing ARIA Labels on Icon Buttons and Input Elements
**Learning:** Found several icon-only buttons (like `filmsync-send-btn`, `filmsync-close-btn`) and text inputs (`usernameInput`, `joinRoomCodeInput`) missing `aria-label`s. Injected elements that function as interactive avatar selectors (`userAvatarDisplay`) also lack full keyboard accessibility.
**Action:** Adding `aria-label` to all icon buttons and text inputs for screen reader support. Adding `role="button"`, `tabindex="0"`, and keyboard handlers (Enter/Space) to the interactive span `userAvatarDisplay`.
