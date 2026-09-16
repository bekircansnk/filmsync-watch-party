
## 2026-09-16 - Add Accessibility to Popup Extension Elements
**Learning:** The popup contained custom `<span>` elements used as interactive buttons without `role="button"`, `tabindex="0"`, or keyboard event listeners. Injected dynamic HTML elements and form inputs were missing `aria-label`s.
**Action:** Ensure all interactive elements lacking semantic HTML button tags have correct roles, tabindexes, and keydown handlers. Add `aria-label` to form inputs and dynamically created buttons.
