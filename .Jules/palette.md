## 2024-10-20 - Emoji Avatars Need Context
**Learning:** The application heavily utilizes raw emojis for avatar selection. While visually distinct, screen readers announce these as literal unicode names (e.g., "fire", "fox face"), lacking the context that these are selectable profile options.
**Action:** When using emojis as functional UI components (like avatars), always pair them with contextual `aria-label`s to describe their purpose within the app, not just the visual character.
