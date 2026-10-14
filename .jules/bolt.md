## 2026-10-14 - Leading-Edge Throttling for UI Events
**Learning:** When throttling high-frequency UI events (like `mousemove` for the fullscreen toolbar) in this extension, using a trailing-edge throttle introduces perceptible UI latency and degrades user experience.
**Action:** Always implement a leading-edge execution strategy (triggering immediately on the first event, then dropping during timeout) for UI visibility toggles.
