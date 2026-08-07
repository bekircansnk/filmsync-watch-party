## 2026-08-07 - Accessibility of Custom UI Components
**Learning:** Custom UI components that function as buttons (like icon-only divs, or the emoji badge avatar selector in this app) often lack keyboard accessibility and screen reader support, unlike native `<button>` tags.
**Action:** When implementing clickable custom elements, always ensure they are accessible by adding `role="button"`, `tabindex="0"`, a descriptive `aria-label`, focus-visible styles, and a `keydown` listener to handle 'Enter' and 'Space' key triggers.
