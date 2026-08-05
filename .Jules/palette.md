## 2026-08-05 - Interactive Emojis Need Accessibility
**Learning:** Interactive emojis used as buttons need proper ARIA roles and keyboard listeners to be accessible to keyboard and screen reader users.
**Action:** Add role="button", tabindex="0", aria-label, and a keydown listener for 'Enter' and 'Space' when using an emoji as a button.
