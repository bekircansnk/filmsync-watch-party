
## 2024-09-21 - Add keyboard accessibility to interactive elements
**Learning:** Icon-only interactive `span` elements (like avatars acting as buttons) frequently miss keyboard accessibility. Even with `title` attributes, they lack focusability (`tabindex="0"`), semantic roles (`role="button"`), and keyboard event handlers (for Enter/Space), rendering them unusable for keyboard-only and screen-reader users.
**Action:** Always ensure that dynamically injected or existing non-button interactive elements explicitly include `role="button"`, `tabindex="0"`, `aria-label`, and keyboard event handlers (`keydown` for 'Enter' and 'Space') to guarantee inclusive access.
