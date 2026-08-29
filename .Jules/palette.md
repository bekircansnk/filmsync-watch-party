## 2026-08-29 - Make custom span button accessible
**Learning:** Custom interactive elements (like <span> acting as buttons) often lack native keyboard accessibility and screen reader support, frustrating users who rely on non-mouse navigation.
**Action:** Always explicitly add role="button", tabindex="0", an aria-label, and a keydown listener for 'Enter' and 'Space' keys to ensure custom elements are fully accessible.
