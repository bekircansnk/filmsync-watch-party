## 2026-10-13 - Throttle High-Frequency UI Events
**Learning:** When throttling high-frequency UI events like mousemove for showing a toolbar, implementing a leading-edge execution strategy (triggering the action immediately on the first event, then dropping subsequent events during the timeout) is superior. Delaying execution by the throttle duration (trailing-edge only) introduces perceptible UI latency and degrades user experience.
**Action:** Always use leading-edge throttling for interactive UI elements that require immediate feedback.
