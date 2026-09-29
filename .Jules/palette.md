## 2026-09-29 - Keyboard Accessibility & ARIA labels in Popup

**Learning:** Adding keyboard support (tabindex="0" and keydown handlers) for custom interactive elements (like the avatar picker) ensures screen reader and keyboard users can trigger these actions natively. Utilizing <label for="..."> instead of independent text <span> for switch toggles improves form control context.

**Action:** Consistently verify that custom interactive elements like badges/avatars acting as buttons have appropriate ARIA attributes, tabindex, and keyboard event listeners, and use semantic labels for inputs and toggles.
