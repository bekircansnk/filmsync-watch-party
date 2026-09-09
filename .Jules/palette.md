## 2024-09-09 - [Missing ARIA Labels on Form Inputs]
**Learning:** Found that the inputs in popup.html (username, room join code, host only switch) do not have aria-labels associated with them. Since there are no explicit `<label>` elements connected via `for`/`id`, screen readers might have trouble identifying the purpose of these fields. This is an accessibility gap.
**Action:** Always verify form elements have explicit labeling, and when visual labels are not directly linked, add `aria-label` to provide context for screen readers.
