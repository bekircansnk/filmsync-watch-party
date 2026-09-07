## 2024-09-07 - Input Fields Missing Accessibility Labels
**Learning:** The popup HTML file lacks `aria-label` attributes on inputs (username, room code, host switch), which rely only on visual placeholders or adjacent text, reducing accessibility for screen reader users.
**Action:** Add `aria-label` to input fields that do not have an explicit `<label for="...">` associated with them to improve keyboard and screen reader accessibility.
