## 2024-05-16 - Add ARIA Labels and Roles

**Learning:** When reviewing `popup.html`, I noticed there are many buttons that don't have proper `aria-label` attributes to make them accessible for screen readers, as well as icons acting as buttons that lack `aria-label`, `role="button"`, and `tabindex`.
**Action:** Adding accessibility markup like `aria-label` makes extensions easier to use for everyone. Next time I work on a similar extension or frontend code, I should look for missing ARIA attributes and missing role/tabindex properties on interactive elements.
