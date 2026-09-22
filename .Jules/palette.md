## 2023-09-22 - Missing ARIA Labels on Icon Buttons in extension/content.js
**Learning:** Found that custom UI elements (like mini-toolbar, chat close, and reaction buttons) in dynamically injected HTML strings via content scripts often lack basic ARIA accessibility attributes, breaking screen reader usability for these crucial controls.
**Action:** Always verify `aria-label` is present on any button containing only an SVG or emoji icon.
