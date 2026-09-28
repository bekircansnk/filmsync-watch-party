## 2026-09-28 - Interactive Element Accessibility
**Learning:** Icon-only spans used as avatar selectors and text inputs relying solely on placeholders lack context for screen readers.
**Action:** Always add `role="button"`, `tabindex="0"`, and `aria-label` to interactive spans, and explicitly define `aria-label` on text inputs that lack visible associated `<label>` elements.
