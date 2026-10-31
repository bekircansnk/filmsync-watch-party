## 2024-10-31 - Focus States Suppressed by !important in Input Wrappers
**Learning:** In FilmSync's popup, global input focus styles are completely overridden by `.user-input-wrapper input` using `!important` rules for borders, backgrounds, and shadows, causing a total loss of visual keyboard focus feedback.
**Action:** Always add a `:focus-within` pseudo-class to custom input wrappers when stripping default styles from inner inputs to ensure accessibility and clear focus states are maintained.
