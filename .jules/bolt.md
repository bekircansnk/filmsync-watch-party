## 2026-10-11 - Missing throttling on high-frequency UI events
**Learning:** In a leading-edge execution strategy context, attaching a simple callback to a high-frequency event like `mousemove` causes significant main-thread overhead, as it resets timers and toggles UI elements continuously without a cooldown.
**Action:** Always implement a throttle (e.g., using a boolean flag and `setTimeout`) with a leading-edge strategy for high-frequency DOM events to preserve responsiveness while eliminating redundant operations.
